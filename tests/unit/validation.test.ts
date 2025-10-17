import { describe, expect, it } from 'vitest';
import { transactionSchema } from '@/lib/validations';

describe('transactionSchema', () => {
  it('valida payload correto', () => {
    const result = transactionSchema.safeParse({
      type: 'IN',
      amount: 100,
      categoryId: 'cl9g8t1k60001smx6y0h1a2zq',
      date: new Date().toISOString()
    });
    expect(result.success).toBe(true);
  });

  it('rejeita payload negativo', () => {
    const result = transactionSchema.safeParse({
      type: 'OUT',
      amount: -10,
      categoryId: 'cl9g8t1k60001smx6y0h1a2zq',
      date: new Date().toISOString()
    });
    expect(result.success).toBe(false);
  });
});
