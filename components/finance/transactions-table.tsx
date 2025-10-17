'use client';

import { useMemo, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { TransactionType } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { currencyFormat } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type TransactionRow = {
  id: string;
  date: string;
  category: string;
  type: TransactionType;
  amount: number;
  note?: string | null;
};

export function TransactionsTable({ data }: { data: TransactionRow[] }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<TransactionRow>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Data',
        cell: ({ getValue }) => <span>{getValue<string>()}</span>
      },
      {
        accessorKey: 'category',
        header: 'Categoria'
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ getValue }) => (
          <Badge className={getValue<TransactionType>() === 'IN' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}>
            {getValue<TransactionType>() === 'IN' ? 'Entrada' : 'Saída'}
          </Badge>
        )
      },
      {
        accessorKey: 'amount',
        header: 'Valor',
        cell: ({ getValue }) => <span className="font-semibold">{currencyFormat(getValue<number>())}</span>
      },
      {
        accessorKey: 'note',
        header: 'Observação'
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString'
  });

  return (
    <div className="space-y-4">
      <Input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Filtrar" />
      <div className="overflow-hidden rounded-xl border border-grayui-100 shadow-sm dark:border-grayui-800">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
