import { describe, expect, it } from 'vitest';
import { financeToCsv, healthToCsv } from '@/lib/exporters';

describe('exporters', () => {
  it('gera CSV financeiro com cabeçalho', () => {
    const csv = financeToCsv([
      { date: '2024-01-01', type: 'IN', category: 'Salário', amount: '1000', note: 'Teste' }
    ]);
    expect(csv).toContain('date,type,category,amount,note');
    expect(csv).toContain('Salário');
  });

  it('gera CSV de saúde', () => {
    const csv = healthToCsv([{ date: '2024-01-02', weight: '80.0' }]);
    expect(csv).toContain('weight');
    expect(csv).toContain('80.0');
  });
});
