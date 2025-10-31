import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { buildPagination, safeJSON } from '@/lib/utils';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  categoria: z.string().optional(),
  search: z.string().optional()
});

const createSchema = z.object({
  nome: z.string().min(2),
  categoria: z.string().min(2),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  unidade: z.string().optional().nullable(),
  quantidade: z.number().int().min(0)
});

export async function GET(request: Request) {
  try {
    await requireAbility('inventory.read');
    const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = {
      ...(query.categoria ? { categoria: { contains: query.categoria, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { nome: { contains: query.search, mode: 'insensitive' } },
              { marca: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const [items, total] = await Promise.all([
      prisma.materialEstoqueItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.materialEstoqueItem.count({ where })
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
    return NextResponse.json({ error: 'Erro ao consultar materiais' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('inventory.write');
    const payload = createSchema.parse(await request.json());

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const item = await prisma.materialEstoqueItem.create({
      data: {
        ...payload,
        marca: payload.marca ?? null,
        modelo: payload.modelo ?? null,
        unidade: payload.unidade ?? null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ESTOQUE_MATERIAL_CREATE',
        entity: 'MaterialEstoqueItem',
        entityId: item.id,
        after: item
      }
    });

    return NextResponse.json(safeJSON(item), { status: 201 });
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
    return NextResponse.json({ error: 'Erro ao cadastrar material' }, { status: 500 });
  }
}
