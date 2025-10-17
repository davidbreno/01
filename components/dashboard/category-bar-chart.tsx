'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type CategoryBarDatum = {
  categoria: string;
  entrada: number;
  saida: number;
};

export function CategoryBarChart({ data }: { data: CategoryBarDatum[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 16, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="categoria" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16 }} />
          <Legend />
          <Bar dataKey="entrada" stackId="a" fill="#159765" radius={12} />
          <Bar dataKey="saida" stackId="a" fill="#f59e0b" radius={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
