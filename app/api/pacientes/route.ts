import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPagination, safeJSON } from '@/lib/utils';
import { pacienteQuerySchema, pacienteSchema } from '@/lib/validations/paciente';
import { requireAbility } from '@/lib/auth-helpers';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    await requireAbility('patients.read');
    const query = pacienteQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = {
      arquivado: query.arquivado ?? false,
      ...(query.search
        ? {
            OR: [
              { nome: { contains: query.search, mode: 'insensitive' } },
              { cpf: { contains: query.search.replace(/\D/g, '') } }
            ]
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        orderBy: { [query.orderBy]: query.order },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.paciente.count({ where })
    ]);
    return NextResponse.json({ items: safeJSON(items), meta: buildPagination(total, query.page, query.pageSize) });
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
    return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('patients.write');
    const payload = pacienteSchema.parse(await request.json());
    const paciente = await prisma.paciente.create({
      data: {
        ...payload,
        nascimento: payload.nascimento instanceof Date ? payload.nascimento : new Date(payload.nascimento)
      }
    });
    await writeAuditLog({
      userId: session.user.id,
      action: 'PACIENTE_CREATE',
      entity: 'Paciente',
      entityId: paciente.id,
      after: paciente,
      ip: request.headers.get('x-forwarded-for')
    });
    return NextResponse.json(safeJSON(paciente), { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 409 });
    }
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
    return NextResponse.json({ error: 'Erro ao criar paciente' }, { status: 500 });
  }
}
