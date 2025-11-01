import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { implantSchema } from '@/lib/validations/estoque';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

interface Params {
  params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('estoque.write');
    const payload = implantSchema.partial({ imagemUrl: true }).parse(await request.json());
    const before = await prisma.implantItem.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Implante não encontrado' }, { status: 404 });
    }
    const item = await prisma.implantItem.update({ where: { id: params.id }, data: payload });
    await prisma.auditLog.create({
      userId: session.user.id,
      action: 'IMPLANT_UPDATE',
      entity: 'ImplantItem',
      entityId: item.id,
      before,
      after: item
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
      return NextResponse.json({ error: error.issues?.[0]?.message ?? 'Dados inválidos' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar implante' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireAbility('estoque.write');
    const before = await prisma.implantItem.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Implante não encontrado' }, { status: 404 });
    }
    await prisma.implantItem.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      userId: session.user.id,
      action: 'IMPLANT_DELETE',
      entity: 'ImplantItem',
      entityId: params.id,
      before
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
