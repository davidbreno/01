import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consultaQuerySchema, consultaSchema } from '@/lib/validations/consulta';
import { buildPagination, safeJSON } from '@/lib/utils';
import { requireAbility } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit';
import { Status } from '@prisma/client';

export async function GET(request: Request) {
  try {
    await requireAbility('consultas.read');
    const params = consultaQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.medicoId ? { medicoId: params.medicoId } : {}),
      ...(params.pacienteId ? { pacienteId: params.pacienteId } : {}),
      ...(params.start && params.end
        ? {
            inicio: { gte: params.start },
            fim: { lte: params.end }
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.consulta.findMany({
        where,
        include: { paciente: true, medico: true },
        orderBy: { inicio: 'asc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize
      }),
      prisma.consulta.count({ where })
    ]);
    return NextResponse.json({ items: safeJSON(items), meta: buildPagination(total, params.page, params.pageSize) });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar consultas' }, { status: 500 });
  }
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

export async function POST(request: Request) {
  try {
    const session = await requireAbility('consultas.write');
    const payload = consultaSchema.parse(await request.json());
    await assertNoConflict(payload.medicoId, payload.inicio, payload.fim);
    const consulta = await prisma.consulta.create({
      data: payload,
      include: { paciente: true, medico: true }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: 'CONSULTA_CREATE',
      entity: 'Consulta',
      entityId: consulta.id,
      after: consulta,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json(safeJSON(consulta), { status: 201 });
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
    return NextResponse.json({ error: 'Erro ao criar consulta' }, { status: 500 });
  }
}
