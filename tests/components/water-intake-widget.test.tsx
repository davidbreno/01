import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WaterIntakeWidget } from '@/components/health/water-intake-widget';

describe('WaterIntakeWidget', () => {
  it('exibe progresso em porcentagem', () => {
    render(<WaterIntakeWidget value={1500} goal={3000} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
