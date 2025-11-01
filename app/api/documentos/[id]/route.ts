import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';

interface Params {
  params: { id: string };
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireAbility('documentos.write');
    const before = await prisma.documentRecord.findUnique({ where: { id: params.id } });
    if (!before) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }
    await prisma.documentRecord.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      userId: session.user.id,
      action: 'DOCUMENT_DELETE',
      entity: 'DocumentRecord',
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
    return NextResponse.json({ error: 'Erro ao remover documento' }, { status: 500 });
  }
}
