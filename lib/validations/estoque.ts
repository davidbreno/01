import { ImplantCategory } from '@prisma/client';
import { z } from 'zod';

export const implantSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do implante'),
  categoria: z.nativeEnum(ImplantCategory),
  modelo: z.string().min(1, 'Informe o modelo'),
  tamanho: z.string().optional().nullable(),
  marca: z.string().min(1, 'Informe a marca'),
  quantidade: z.coerce.number().int().min(0, 'Quantidade inválida'),
  imagemUrl: z.string().url().optional().nullable(),
  descricao: z.string().optional().nullable()
});

export type ImplantFormValues = z.infer<typeof implantSchema>;

export const materialSchema = z.object({
  nome: z.string().min(1, 'Informe o material'),
  marca: z.string().optional().nullable(),
  unidade: z.string().min(1, 'Informe a unidade'),
  quantidade: z.coerce.number().int().min(0, 'Quantidade inválida'),
  descricao: z.string().optional().nullable()
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
