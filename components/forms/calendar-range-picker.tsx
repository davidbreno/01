'use client';

import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { addDays } from 'date-fns';
import { useState } from 'react';

export type CalendarRangePickerProps = {
  value: { from: Date; to: Date } | null;
  onChange: (range: { from: Date; to: Date } | null) => void;
};

export function CalendarRangePicker({ value, onChange }: CalendarRangePickerProps) {
  const [selected, setSelected] = useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );

  return (
    <div className="space-y-3">
      <DayPicker
        locale={ptBR}
        mode="range"
        selected={selected}
        onSelect={(range) => {
          setSelected(range ?? undefined);
          if (range?.from && range?.to) {
            onChange({ from: range.from, to: range.to });
          } else {
            onChange(null);
          }
        }}
        defaultMonth={value?.from ?? addDays(new Date(), -7)}
        modifiersClassNames={{
          selected: 'bg-primary-500 text-white'
        }}
      />
    </div>
  );
}
