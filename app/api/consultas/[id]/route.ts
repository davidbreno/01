import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consultaSchema } from '@/lib/validations/consulta';
import { requireAbility } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit';
import { safeJSON } from '@/lib/utils';
import { Status } from '@prisma/client';

interface Params {
  params: { id: string };
}

async function assertNoConflict(medicoId: string, inicio: Date, fim: Date, ignoreId?: string) {
  const conflict = await prisma.consulta.findFirst({
    where: {
      id: ignoreId ? { not: ignoreId } : undefined,
      medicoId,
      status: { in: [Status.AGENDADA, Status.CONFIRMADA] },
      AND: [
        { inicio: { lt: fim } },
        { fim: { gt: inicio } }
      ]
    }
  });
  if (conflict) {
    const error = new Error('Horário indisponível para o médico selecionado');
    error.name = 'ScheduleConflict';
    throw error;
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAbility('consultas.read');
    const consulta = await prisma.consulta.findUnique({
      where: { id: params.id },
      include: { paciente: true, medico: true }
    });
    if (!consulta) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }
    return NextResponse.json(safeJSON(consulta));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao carregar consulta' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('consultas.write');
    const payload = consultaSchema.parse(await request.json());
    const before = await prisma.consulta.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }
    await assertNoConflict(payload.medicoId, payload.inicio, payload.fim, params.id);
    const rawBefore = before as any;
    const data: any = {
      ...payload,
      lembreteAtivo: !!payload.lembreteAtivo,
      lembreteAntecedenciaMinutos: payload.lembreteAtivo
        ? payload.lembreteAntecedenciaMinutos ?? rawBefore?.lembreteAntecedenciaMinutos ?? 30
        : null,
      lembreteEnviadoEm: payload.lembreteAtivo ? rawBefore?.lembreteEnviadoEm ?? null : null
    };
    const consulta = await prisma.consulta.update({
      where: { id: params.id },
      data,
      include: { paciente: true, medico: true }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: 'CONSULTA_UPDATE',
      entity: 'Consulta',
      entityId: consulta.id,
      before,
      after: consulta,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json(safeJSON(consulta));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.issues?.[0]?.message ?? 'Dados inválidos' }, { status: 400 });
    }
    if (error.name === 'ScheduleConflict') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar consulta' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('consultas.write');
    const before = await prisma.consulta.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }
    await prisma.consulta.delete({ where: { id: params.id } });
    await writeAuditLog({
      userId: session.user.id,
      action: 'CONSULTA_DELETE',
      entity: 'Consulta',
      entityId: params.id,
      before,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao remover consulta' }, { status: 500 });
  }
}
