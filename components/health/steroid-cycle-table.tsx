'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { differenceInDays, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export type SteroidCycleRow = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalMg: number;
  compounds: number;
  alerts: string[];
};

export function SteroidCycleTable({ data }: { data: SteroidCycleRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-grayui-100 shadow-sm dark:border-grayui-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ciclo</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Compostos</TableHead>
            <TableHead>Total mg</TableHead>
            <TableHead>Alertas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cycle) => {
            const duration = differenceInDays(new Date(cycle.endDate), new Date(cycle.startDate));
            return (
              <TableRow key={cycle.id}>
                <TableCell className="font-semibold">{cycle.name}</TableCell>
                <TableCell>{format(new Date(cycle.startDate), 'dd MMM', { locale: ptBR })}</TableCell>
                <TableCell>{format(new Date(cycle.endDate), 'dd MMM', { locale: ptBR })}</TableCell>
                <TableCell>{duration} dias</TableCell>
                <TableCell>{cycle.compounds}</TableCell>
                <TableCell>{cycle.totalMg} mg</TableCell>
                <TableCell>
                  <ul className="space-y-1 text-xs">
                    {cycle.alerts.map((alert) => (
                      <li key={alert} className="text-danger">
                        {alert}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
