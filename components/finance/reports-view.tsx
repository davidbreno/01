'use client';

import { useState, useMemo } from 'react';
import { CalendarRangePicker } from '@/components/forms/calendar-range-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceAreaChart } from '@/components/dashboard/balance-area-chart';
import { CategoryBarChart } from '@/components/dashboard/category-bar-chart';
import { ExportButton } from '@/components/ui/export-button';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export type ReportTransaction = {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  category: string;
  date: string | Date;
};

type Props = {
  data: ReportTransaction[];
};

export function ReportsView({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [range, setRange] = useState<{ from: Date; to: Date } | null>(null);

  const filtered = useMemo(() => {
    if (!range) return data;
    return data.filter((item) => {
      const date = new Date(item.date);
      return date >= range.from && date <= range.to;
    });
  }, [data, range]);

  const balanceData = useMemo(() => {
    return filtered.map((item) => ({
      date: format(new Date(item.date), 'dd MMM', { locale: ptBR }),
      saldo: item.type === 'IN' ? item.amount : -item.amount
    }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const grouped = filtered.reduce<Record<string, { in: number; out: number }>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = { in: 0, out: 0 };
      if (item.type === 'IN') acc[item.category].in += item.amount;
      else acc[item.category].out += item.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([categoria, values]) => ({
      categoria,
      entrada: values.in,
      saida: values.out
    }));
  }, [filtered]);

  return (
    <div className="col-span-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-full bg-white/70 p-1 shadow-soft dark:bg-grayui-800/70">
          <button
            className={`rounded-full px-4 py-2 text-sm ${activeTab === 'weekly' ? 'bg-primary-600 text-white shadow-soft' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Semanal
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm ${activeTab === 'monthly' ? 'bg-primary-600 text-white shadow-soft' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            Mensal
          </button>
        </div>
        <ExportButton payload={{ type: 'FINANCE', range: activeTab, filters: range }} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selecione o período</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarRangePicker value={range} onChange={setRange} />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Saldo {activeTab === 'weekly' ? 'semanal' : 'mensal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceAreaChart data={balanceData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
