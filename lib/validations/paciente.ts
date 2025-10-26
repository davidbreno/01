import { z } from 'zod';

export const pacienteSchema = z.object({
  nome: z.string().min(3),
  cpf: z
    .string()
    .regex(/\d{11}/, 'CPF deve conter 11 dígitos')
    .transform((value) => value.replace(/\D/g, '')),
  nascimento: z.string().or(z.date()).transform((value) => new Date(value)),
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).or(z.string().min(1)),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  endereco: z.string().optional().nullable(),
  convenio: z.string().optional().nullable(),
  carteirinha: z.string().optional().nullable(),
  alergias: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable()
});

export const pacienteQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  arquivado: z.coerce.boolean().optional(),
  orderBy: z.enum(['nome', 'createdAt']).default('nome'),
  order: z.enum(['asc', 'desc']).default('asc')
});
