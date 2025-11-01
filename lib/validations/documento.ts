import { DocumentType } from '@prisma/client';
import { z } from 'zod';

export const documentSchema = z.object({
  titulo: z.string().min(1, 'Informe um título'),
  tipo: z.nativeEnum(DocumentType),
  arquivoUrl: z.string().min(1),
  arquivoMime: z.string().min(1),
  pacienteId: z.string().optional().nullable(),
  notas: z.string().optional().nullable()
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
