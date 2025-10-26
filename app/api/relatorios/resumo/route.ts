import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    await requireAbility('consultas.read');
    const searchParams = new URL(request.url).searchParams;
    const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date();

    const [pacientes, consultasPorStatus, consultasPorMedico] = await Promise.all([
      prisma.paciente.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.consulta.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: {
          inicio: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.consulta.groupBy({
        by: ['medicoId'],
        _count: { _all: true },
        where: {
          inicio: {
            gte: start,
            lte: end
          }
        }
      })
    ]);

    const medicos = await prisma.user.findMany({
      where: { role: Role.MEDICO, id: { in: consultasPorMedico.map((c) => c.medicoId) } },
      select: { id: true, name: true }
    });

    return NextResponse.json({
      periodo: { start, end },
      novosPacientes: pacientes,
      consultasPorStatus,
      consultasPorMedico: consultasPorMedico.map((item) => ({
        medicoId: item.medicoId,
        medico: medicos.find((medico) => medico.id === item.medicoId)?.name ?? 'Não informado',
        total: item._count._all
      }))
    });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}
