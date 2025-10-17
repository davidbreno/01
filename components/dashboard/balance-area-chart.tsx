'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type BalancePoint = { date: string; saldo: number };

export function BalanceAreaChart({ data }: { data: BalancePoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 16, right: 16 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#147a57" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#147a57" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16 }} />
          <Area type="monotone" dataKey="saldo" stroke="#0f3d2e" fill="url(#balanceGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
