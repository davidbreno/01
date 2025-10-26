import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAbility } from '@/lib/auth-helpers';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export interface RelatorioResumoParams {
  start?: Date;
  end?: Date;
}

export interface RelatorioResumoData {
  periodo: { start: Date; end: Date };
  novosPacientes: number;
  consultasPorStatus: Array<{ status: string; _count: { _all: number } }>;
  consultasPorMedico: Array<{ medicoId: string; medico: string; total: number }>;
}

export async function getRelatorioResumo(params: RelatorioResumoParams = {}): Promise<RelatorioResumoData> {
  await requireAbility('consultas.read');

  const rangeEnd = params.end ?? new Date();
  const defaultStart = new Date(rangeEnd.getTime() - THIRTY_DAYS_IN_MS);
  const rangeStart = params.start ?? defaultStart;

  if (Number.isNaN(rangeStart.valueOf()) || Number.isNaN(rangeEnd.valueOf())) {
    throw new Error('Período inválido informado.');
  }

  if (rangeStart > rangeEnd) {
    throw new Error('Período inválido: início após o fim.');
  }

  const [novosPacientes, consultasPorStatus, consultasPorMedico] = await Promise.all([
    prisma.paciente.count({
      where: {
        createdAt: {
          gte: rangeStart,
          lte: rangeEnd
        }
      }
    }),
    prisma.consulta.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: {
        inicio: {
          gte: rangeStart,
          lte: rangeEnd
        }
      }
    }),
    prisma.consulta.groupBy({
      by: ['medicoId'],
      _count: { _all: true },
      where: {
        inicio: {
          gte: rangeStart,
          lte: rangeEnd
        }
      }
    })
  ]);

  const medicos = await prisma.user.findMany({
    where: { role: Role.MEDICO, id: { in: consultasPorMedico.map((c) => c.medicoId) } },
    select: { id: true, name: true }
  });

  return {
    periodo: { start: rangeStart, end: rangeEnd },
    novosPacientes,
    consultasPorStatus,
    consultasPorMedico: consultasPorMedico.map((item) => ({
      medicoId: item.medicoId,
      medico: medicos.find((medico) => medico.id === item.medicoId)?.name ?? 'Não informado',
      total: item._count._all
    }))
  };
}
