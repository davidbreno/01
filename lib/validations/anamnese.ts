import { z } from 'zod';

export const anamneseRespostaSchema = z.object({
  questionId: z.string().min(1),
  resposta: z.string().min(1, 'Preencha a resposta')
});

export const anamneseUpdateSchema = z.object({
  pacienteId: z.string().min(1),
  respostas: z.array(anamneseRespostaSchema)
});

export type AnamneseUpdatePayload = z.infer<typeof anamneseUpdateSchema>;
