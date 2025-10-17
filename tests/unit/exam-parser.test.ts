import { describe, expect, it } from 'vitest';
import { parseExamText, referenceRanges } from '@/lib/exams';

describe('parseExamText', () => {
  it('identifica valores dentro e fora da faixa', () => {
    const text = 'Hemoglobina: 16 g/dL\nLDL: 180 mg/dL';
    const results = parseExamText(text);
    expect(results).toHaveLength(2);
    const hemoglobina = results.find((result) => result.marker === 'Hemoglobina');
    const ldl = results.find((result) => result.marker === 'LDL');
    expect(hemoglobina?.isOutOfRange).toBe(false);
    expect(ldl?.isOutOfRange).toBe(true);
    expect(ldl?.referenceMax).toBe(referenceRanges.LDL.max);
  });

  it('marca valores abaixo da referência', () => {
    const text = 'TSH: 0.1 uUI/mL';
    const results = parseExamText(text);
    expect(results[0]?.isOutOfRange).toBe(true);
    expect(results[0]?.referenceMin).toBe(referenceRanges.TSH.min);
  });
});
