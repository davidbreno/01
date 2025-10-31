import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { buildPagination, safeJSON } from '@/lib/utils';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  pacienteId: z.string().cuid().optional(),
  tipo: z.string().optional(),
  search: z.string().optional()
});

const createSchema = z.object({
  pacienteId: z.string().cuid(),
  titulo: z.string().min(3),
  tipo: z.enum(['RECEITA', 'PRONTUARIO', 'DOCUMENTO_PESSOAL', 'RADIOGRAFIA']),
  arquivoUrl: z.string().url(),
  arquivoNome: z.string().min(1),
  mimeType: z.string().min(2),
  tamanho: z.number().int().positive(),
  observacoes: z.string().optional().nullable()
});

export async function GET(request: Request) {
  try {
    await requireAbility('patients.read');
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where = {
      ...(query.pacienteId ? { pacienteId: query.pacienteId } : {}),
      ...(query.tipo ? { tipo: query.tipo } : {}),
      ...(query.search
        ? {
            OR: [
              { titulo: { contains: query.search, mode: 'insensitive' } },
              { arquivoNome: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const [items, total] = await Promise.all([
      prisma.pacienteDocumento.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { paciente: { select: { nome: true } } }
      }),
      prisma.pacienteDocumento.count({ where })
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
    return NextResponse.json({ error: 'Erro ao carregar documentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('patients.write');
    const payload = createSchema.parse(await request.json());

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const documento = await prisma.pacienteDocumento.create({
      data: {
        ...payload,
        observacoes: payload.observacoes ?? null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENTO_PACIENTE_CREATE',
        entity: 'PacienteDocumento',
        entityId: documento.id,
        after: documento
      }
    });

    return NextResponse.json(safeJSON(documento), { status: 201 });
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
    return NextResponse.json({ error: 'Erro ao cadastrar documento' }, { status: 500 });
  }
}
