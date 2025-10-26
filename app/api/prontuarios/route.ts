import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { prontuarioQuerySchema, prontuarioSchema } from '@/lib/validations/prontuario';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    await requireAbility('patients.read');
    const params = prontuarioQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const prontuarios = await prisma.prontuario.findMany({
      where: { pacienteId: params.pacienteId },
      include: { criadoPor: true, consulta: true, anexos: true },
      orderBy: { createdAt: 'desc' },
      take: params.take
    });
    return NextResponse.json(safeJSON(prontuarios));
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
    return NextResponse.json({ error: 'Erro ao buscar prontuários' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('prontuario.write');
    const payload = prontuarioSchema.parse(await request.json());
    const prontuario = await prisma.prontuario.create({
      data: {
        pacienteId: payload.pacienteId,
        consultaId: payload.consultaId ?? undefined,
        criadoPorId: session.user.id,
        conteudo: payload.conteudo,
        anexos: payload.anexos
          ? { create: payload.anexos.map((anexo) => ({ url: anexo.url, mime: anexo.mime })) }
          : undefined
      },
      include: { criadoPor: true, consulta: true, anexos: true }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: 'PRONTUARIO_CREATE',
      entity: 'Prontuario',
      entityId: prontuario.id,
      after: prontuario,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json(safeJSON(prontuario), { status: 201 });
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
    return NextResponse.json({ error: 'Erro ao registrar prontuário' }, { status: 500 });
  }
}
