import { z } from 'zod';
import { Status } from '@prisma/client';

export const consultaSchema = z
  .object({
    pacienteId: z.string().min(1),
    medicoId: z.string().min(1),
    inicio: z.coerce.date(),
    fim: z.coerce.date(),
    status: z.nativeEnum(Status).default(Status.AGENDADA),
    notas: z.string().optional().nullable()
  })
  .refine((data) => data.fim > data.inicio, { message: 'Horário de término deve ser posterior ao início', path: ['fim'] });

export const consultaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  status: z.nativeEnum(Status).optional(),
  medicoId: z.string().optional(),
  pacienteId: z.string().optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional()
});
