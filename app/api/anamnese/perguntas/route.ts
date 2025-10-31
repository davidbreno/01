import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

const createSchema = z.object({
  pergunta: z.string().min(5),
  categoria: z.string().optional().nullable(),
  ordem: z.number().int().optional(),
  ativo: z.boolean().optional()
});

export async function GET() {
  try {
    await requireAbility('patients.read');
    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const perguntas = await prisma.anamnesePergunta.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' }
    });
    return NextResponse.json(safeJSON(perguntas));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao carregar perguntas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('patients.write');
    const payload = createSchema.parse(await request.json());
    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const pergunta = await prisma.anamnesePergunta.create({
      data: {
        pergunta: payload.pergunta,
        categoria: payload.categoria ?? null,
        ordem: payload.ordem ?? 0,
        ativo: payload.ativo ?? true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ANAMNESE_PERGUNTA_CREATE',
        entity: 'AnamnesePergunta',
        entityId: pergunta.id,
        after: pergunta
      }
    });

    return NextResponse.json(safeJSON(pergunta), { status: 201 });
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
    return NextResponse.json({ error: 'Erro ao registrar pergunta' }, { status: 500 });
  }
}
