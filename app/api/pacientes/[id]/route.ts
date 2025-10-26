import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pacienteSchema } from '@/lib/validations/paciente';
import { requireAbility } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit';
import { safeJSON } from '@/lib/utils';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAbility('patients.read');
    const paciente = await prisma.paciente.findUnique({
      where: { id: params.id },
      include: {
        consultas: { orderBy: { inicio: 'desc' }, take: 10, include: { medico: true } },
        prontuarios: { orderBy: { createdAt: 'desc' }, take: 10, include: { criadoPor: true, consulta: true, anexos: true } }
      }
    });
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }
    return NextResponse.json(safeJSON(paciente));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao carregar paciente' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('patients.write');
    const payload = pacienteSchema.parse(await request.json());
    const before = await prisma.paciente.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }
    const paciente = await prisma.paciente.update({
      where: { id: params.id },
      data: {
        ...payload,
        nascimento: payload.nascimento instanceof Date ? payload.nascimento : new Date(payload.nascimento)
      }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: 'PACIENTE_UPDATE',
      entity: 'Paciente',
      entityId: paciente.id,
      before,
      after: paciente,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json(safeJSON(paciente));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar paciente' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('patients.write');
    const before = await prisma.paciente.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }
    const paciente = await prisma.paciente.update({
      where: { id: params.id },
      data: { arquivado: true }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: 'PACIENTE_ARCHIVE',
      entity: 'Paciente',
      entityId: paciente.id,
      before,
      after: paciente,
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
    return NextResponse.json({ error: 'Erro ao arquivar paciente' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('patients.write');
    const before = await prisma.paciente.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }
    const payload = await request.json().catch(() => ({}));
    const arquivado = payload?.arquivado === false ? false : true;
    const paciente = await prisma.paciente.update({
      where: { id: params.id },
      data: { arquivado }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: arquivado ? 'PACIENTE_ARCHIVE' : 'PACIENTE_RESTORE',
      entity: 'Paciente',
      entityId: paciente.id,
      before,
      after: paciente,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json(safeJSON(paciente));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar paciente' }, { status: 500 });
  }
}
