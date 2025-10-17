'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, color }: { data: Array<{ value: number }>; color: string }) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
