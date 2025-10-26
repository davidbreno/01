'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#159765', '#0f3d2e', '#62b790', '#0b241c'];

interface StatusItem {
  status: string;
  _count: { _all: number };
}

interface MedicoItem {
  medicoId: string;
  medico: string;
  total: number;
}

export function ResumoChart({
  status,
  medicos
}: {
  status: StatusItem[];
  medicos: MedicoItem[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-72 rounded-2xl border bg-card p-6">
        <h3 className="text-sm font-semibold">Consultas por status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={status} dataKey="_count._all" nameKey="status" fill="var(--primary)" label>
              {status.map((entry, index) => (
                <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} consultas`, '']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-2xl border bg-card p-6">
        <h3 className="text-sm font-semibold">Consultas por médico</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={medicos}>
            <XAxis dataKey="medico" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => [`${value} consultas`, '']} />
            <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
