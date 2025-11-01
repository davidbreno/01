import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

export async function GET() {
  try {
    await requireAbility('patients.read');
    const questions = await prisma.anamneseQuestion.findMany({
      where: { ativa: true },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(safeJSON(questions));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao listar perguntas' }, { status: 500 });
  }
}
