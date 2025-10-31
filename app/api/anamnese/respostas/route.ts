import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

const getSchema = z.object({ pacienteId: z.string().cuid() });

const upsertSchema = z.object({
  pacienteId: z.string().cuid(),
  respostas: z
    .array(
      z.object({
        perguntaId: z.string().cuid(),
        resposta: z.string().min(1)
      })
    )
    .min(1)
});

export async function GET(request: Request) {
  try {
    await requireAbility('patients.read');
    const { searchParams } = new URL(request.url);
    const query = getSchema.parse(Object.fromEntries(searchParams));

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    const respostas = await prisma.anamneseResposta.findMany({
      where: { pacienteId: query.pacienteId },
      include: { pergunta: true }
    });

    return NextResponse.json(safeJSON(respostas));
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
    return NextResponse.json({ error: 'Erro ao carregar anamnese' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('patients.write');
    const payload = upsertSchema.parse(await request.json());

    // @ts-ignore - modelo customizado declarado no schema Prisma deste projeto
    await prisma.$transaction([
      prisma.anamneseResposta.deleteMany({ where: { pacienteId: payload.pacienteId } }),
      prisma.anamneseResposta.createMany({
        data: payload.respostas.map((item) => ({
          pacienteId: payload.pacienteId,
          perguntaId: item.perguntaId,
          resposta: item.resposta
        }))
      })
    ]);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ANAMNESE_RESPOSTA_SYNC',
        entity: 'AnamneseResposta',
        entityId: payload.pacienteId,
        after: payload.respostas
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
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao registrar anamnese' }, { status: 500 });
  }
}
