import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { buildPagination, safeJSON } from '@/lib/utils';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  categoria: z.enum(['CMI', 'HE', 'HI_TAPA']).optional()
});

const createSchema = z.object({
  categoria: z.enum(['CMI', 'HE', 'HI_TAPA']),
  modelo: z.string().min(2),
  tamanho: z.string().min(1),
  marca: z.string().min(2),
  quantidade: z.number().int().min(0),
  imagemUrl: z.string().url().optional().nullable()
});

export async function GET(request: Request) {
  try {
    await requireAbility('inventory.read');
    const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = {
      ...(query.categoria ? { categoria: query.categoria } : {}),
      ...(query.search
        ? {
            OR: [
              { modelo: { contains: query.search, mode: 'insensitive' } },
              { marca: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const [items, total] = await Promise.all([
      prisma.implanteEstoqueItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.implanteEstoqueItem.count({ where })
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
    return NextResponse.json({ error: 'Erro ao consultar implantes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('inventory.write');
    const payload = createSchema.parse(await request.json());

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const item = await prisma.implanteEstoqueItem.create({
      data: {
        ...payload,
        imagemUrl: payload.imagemUrl ?? null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ESTOQUE_IMPLANTE_CREATE',
        entity: 'ImplanteEstoqueItem',
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
    return NextResponse.json({ error: 'Erro ao cadastrar implante' }, { status: 500 });
  }
}
