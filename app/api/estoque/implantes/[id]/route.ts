import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

const updateSchema = z.object({
  quantidade: z.number().int().min(0).optional(),
  imagemUrl: z.string().url().optional().nullable(),
  modelo: z.string().optional(),
  tamanho: z.string().optional(),
  marca: z.string().optional()
});

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('inventory.write');
    const payload = updateSchema.parse(await request.json());

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const before = await prisma.implanteEstoqueItem.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Implante não encontrado' }, { status: 404 });
    }

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const item = await prisma.implanteEstoqueItem.update({
      where: { id: params.id },
      data: {
        ...payload,
        imagemUrl: payload.imagemUrl ?? before.imagemUrl
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ESTOQUE_IMPLANTE_UPDATE',
        entity: 'ImplanteEstoqueItem',
        entityId: item.id,
        before,
        after: item
      }
    });

    return NextResponse.json(safeJSON(item));
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
    return NextResponse.json({ error: 'Erro ao atualizar implante' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireAbility('inventory.write');
    // @ts-ignore
    const before = await prisma.implanteEstoqueItem.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Implante não encontrado' }, { status: 404 });
    }
    // @ts-ignore
    await prisma.implanteEstoqueItem.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ESTOQUE_IMPLANTE_DELETE',
        entity: 'ImplanteEstoqueItem',
        entityId: params.id,
        before
      }
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
    return NextResponse.json({ error: 'Erro ao remover implante' }, { status: 500 });
  }
}
