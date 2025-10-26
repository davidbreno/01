import { NextResponse } from 'next/server';
import { getRelatorioResumo } from '@/lib/services/relatorios';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    const start = startParam ? new Date(startParam) : undefined;
    const end = endParam ? new Date(endParam) : undefined;

    const resumo = await getRelatorioResumo({ start, end });

    return NextResponse.json(resumo);
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: error.message ?? 'Erro ao gerar relatório' }, { status: 500 });
  }
}
