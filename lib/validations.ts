import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  amount: z.number().positive(),
  categoryId: z.string().cuid(),
  date: z.string(),
  note: z.string().optional()
});

export const billSchema = z.object({
  title: z.string().min(3),
  amount: z.number().positive(),
  dueDate: z.string(),
  status: z.enum(['PENDING', 'PAID'])
});

export const weightSchema = z.object({
  date: z.string(),
  weightKg: z.number().positive()
});

export const waterSchema = z.object({
  date: z.string(),
  ml: z.number().positive()
});

export const cycleSchema = z.object({
  name: z.string().min(3),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
  doses: z
    .array(
      z.object({
        compound: z.string().min(2),
        dosageMgPerWeek: z.number().positive(),
        scheduleJson: z.string().min(2)
      })
    )
    .min(2)
});

export const exportSchema = z.object({
  type: z.enum(['FINANCE', 'HEALTH']),
  format: z.enum(['CSV', 'PDF']).default('CSV'),
  filters: z.record(z.any()).optional()
});
