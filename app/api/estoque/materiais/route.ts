import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { materialSchema } from '@/lib/validations/estoque';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

export async function GET() {
  try {
    await requireAbility('estoque.read');
    const items = await prisma.materialItem.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(safeJSON(items));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar materiais' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('estoque.write');
    const payload = materialSchema.parse(await request.json());
    const item = await prisma.materialItem.create({ data: payload });
    await prisma.auditLog.create({
      userId: session.user.id,
      action: 'MATERIAL_CREATE',
      entity: 'MaterialItem',
      entityId: item.id,
      after: item
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
      return NextResponse.json({ error: error.issues?.[0]?.message ?? 'Dados inválidos' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao registrar material' }, { status: 500 });
  }
}
