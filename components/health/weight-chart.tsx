'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type WeightChartPoint = {
  date: string;
  weight: number;
};

export function WeightChart({ data }: { data: WeightChartPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 16, right: 16 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#159765" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#159765" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip contentStyle={{ borderRadius: 16 }} />
          <Area type="monotone" dataKey="weight" stroke="#147a57" fill="url(#weightGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
