'use client';

import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export type WaterIntakeWidgetProps = {
  value: number;
  goal: number;
};

export function WaterIntakeWidget({ value, goal }: WaterIntakeWidgetProps) {
  const progress = Math.min(100, Math.round((value / goal) * 100));
  const chartData = [{ name: 'Meta', value: progress, fill: '#159765' }];

  return (
    <div className="relative flex h-60 flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar cornerRadius={20} minAngle={15} dataKey="value" clockWise />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-semibold text-primary-700 dark:text-primary-100">{progress}%</p>
        <p className="text-xs text-grayui-500 dark:text-grayui-300">{value} ml de {goal} ml</p>
      </div>
    </div>
  );
}
