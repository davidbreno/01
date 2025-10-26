import { z } from 'zod';

export const prontuarioSchema = z.object({
  pacienteId: z.string().min(1),
  consultaId: z.string().optional().nullable(),
  conteudo: z.object({
    anamnese: z.string().optional().nullable(),
    diagnostico: z.string().optional().nullable(),
    prescricao: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable()
  }),
  anexos: z
    .array(
      z.object({
        url: z.string().url(),
        mime: z.string().min(3)
      })
    )
    .optional()
});

export const prontuarioQuerySchema = z.object({
  pacienteId: z.string().min(1),
  take: z.coerce.number().min(1).max(50).default(20)
});
