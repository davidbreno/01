import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireAbility('consultas.read');
    const medicos = await prisma.user.findMany({
      where: { role: Role.MEDICO },
      select: { id: true, name: true }
    });
    return NextResponse.json(medicos);
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar médicos' }, { status: 500 });
  }
}
