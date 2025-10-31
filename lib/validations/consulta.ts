import { Status } from '@prisma/client';
import { z } from 'zod';

const pacienteIdField = z.string().min(1);
const medicoIdField = z.string().min(1);
const notasField = z.string().optional().nullable();
const horarioMessage = 'Horário de término deve ser posterior ao início';

export const consultaSchema = z
  .object({
    pacienteId: pacienteIdField,
    medicoId: medicoIdField,
    inicio: z.coerce.date(),
    fim: z.coerce.date(),
    status: z.nativeEnum(Status).default(Status.AGENDADA),
    notas: notasField,
    lembreteAtivo: z.boolean().default(false),
    lembreteAntecedenciaMinutos: z
      .number()
      .int()
      .min(5, 'Informe um lembrete a partir de 5 minutos')
      .max(2880, 'Lembrete pode ter no máximo 48 horas')
      .optional()
      .nullable()
  })
  .refine((data) => data.fim > data.inicio, { message: horarioMessage, path: ['fim'] });

const statusValues = [
  Status.AGENDADA,
  Status.CONFIRMADA,
  Status.CANCELADA,
  Status.CONCLUIDA
] as const;

export const consultaFormSchema = z
  .object({
    pacienteId: pacienteIdField,
    medicoId: medicoIdField,
    inicio: z.string().min(1),
    fim: z.string().min(1),
    status: z.enum(statusValues),
    notas: notasField,
    lembreteAtivo: z.boolean().optional(),
    lembreteAntecedenciaMinutos: z.string().optional().nullable()
  })
  .refine((data) => {
    const inicio = new Date(data.inicio);
    const fim = new Date(data.fim);
    return !Number.isNaN(inicio.valueOf()) && !Number.isNaN(fim.valueOf()) && fim > inicio;
  }, { message: horarioMessage, path: ['fim'] })
  .superRefine((data, ctx) => {
    if (data.lembreteAtivo) {
      const parsed = Number(data.lembreteAntecedenciaMinutos ?? '');
      if (!parsed || Number.isNaN(parsed) || parsed < 5 || parsed > 2880) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe um lembrete entre 5 e 2880 minutos',
          path: ['lembreteAntecedenciaMinutos']
        });
      }
    }
  });

export type ConsultaFormValues = z.infer<typeof consultaFormSchema>;

export const consultaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  status: z.nativeEnum(Status).optional(),
  medicoId: z.string().optional(),
  pacienteId: z.string().optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional()
});
