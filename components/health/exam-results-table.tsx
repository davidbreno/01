'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export type ExamResultRow = {
  id: string;
  marker: string;
  value: number;
  unit?: string | null;
  referenceMin?: number | null;
  referenceMax?: number | null;
  isOutOfRange: boolean;
};

export function ExamResultsTable({ data }: { data: ExamResultRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-grayui-100 shadow-sm dark:border-grayui-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marcador</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Referência</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((result) => (
            <TableRow key={result.id}>
              <TableCell>{result.marker}</TableCell>
              <TableCell>
                {result.value} {result.unit}
              </TableCell>
              <TableCell>
                {result.referenceMin ?? '-'} - {result.referenceMax ?? '-'}
              </TableCell>
              <TableCell>
                {result.isOutOfRange ? (
                  <Badge className="bg-danger/20 text-danger">Fora da faixa</Badge>
                ) : (
                  <Badge className="bg-success/20 text-success">Normal</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
