import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { documentSchema } from '@/lib/validations/documento';
import { requireAbility } from '@/lib/auth-helpers';
import { safeJSON } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    await requireAbility('documentos.read');
    const url = new URL(request.url);
    const pacienteId = url.searchParams.get('pacienteId') ?? undefined;
    const tipo = url.searchParams.get('tipo') ?? undefined;
    const where = {
      ...(pacienteId ? { pacienteId } : {}),
      ...(tipo ? { tipo } : {})
    } as any;
    const documentos = await prisma.documentRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { paciente: { select: { nome: true } } }
    });
    return NextResponse.json(safeJSON(documentos));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAbility('documentos.write');
    const payload = documentSchema.parse(await request.json());
    const documento = await prisma.documentRecord.create({ data: payload });
    await prisma.auditLog.create({
      userId: session.user.id,
      action: 'DOCUMENT_CREATE',
      entity: 'DocumentRecord',
      entityId: documento.id,
      after: documento
    });
    return NextResponse.json(safeJSON(documento), { status: 201 });
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
    return NextResponse.json({ error: 'Erro ao registrar documento' }, { status: 500 });
  }
}
