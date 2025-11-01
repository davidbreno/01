import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';
import { anamneseUpdateSchema } from '@/lib/validations/anamnese';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAbility('patients.read');
    const [questions, answers] = await Promise.all([
      prisma.anamneseQuestion.findMany({ where: { ativa: true }, orderBy: { createdAt: 'asc' } }),
      prisma.anamneseResposta.findMany({ where: { pacienteId: params.id } })
    ]);
    const merged = questions.map((question) => ({
      ...question,
      resposta: answers.find((answer) => answer.questionId === question.id)?.resposta ?? ''
    }));
    return NextResponse.json(safeJSON(merged));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao carregar anamnese' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireAbility('anamnese.write');
    const payload = anamneseUpdateSchema.parse(await request.json());
    if (payload.pacienteId !== params.id) {
      return NextResponse.json({ error: 'Paciente inválido' }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.anamneseResposta.deleteMany({ where: { pacienteId: params.id } }),
      prisma.anamneseResposta.createMany({
        data: payload.respostas.map((resposta) => ({
          pacienteId: params.id,
          questionId: resposta.questionId,
          resposta: resposta.resposta
        }))
      })
    ]);
    await prisma.auditLog.create({
      userId: session.user.id,
      action: 'ANAMNESE_UPDATE',
      entity: 'Paciente',
      entityId: params.id,
      after: payload.respostas
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
    return NextResponse.json({ error: 'Erro ao atualizar anamnese' }, { status: 500 });
  }
}
