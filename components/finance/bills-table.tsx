'use client';

import { useState } from 'react';
import { BillStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { currencyFormat } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export type BillRow = {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  status: BillStatus;
};

export function BillsTable({ data }: { data: BillRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleMark = async (id: string, status: BillStatus) => {
    setLoadingId(id);
    try {
      const response = await fetch('/api/bills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar conta');
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Não foi possível atualizar a conta');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-grayui-100 shadow-sm dark:border-grayui-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conta</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.title}</TableCell>
              <TableCell>{bill.dueDate}</TableCell>
              <TableCell className="font-semibold">{currencyFormat(bill.amount)}</TableCell>
              <TableCell>
                <span className={bill.status === 'PAID' ? 'text-success' : 'text-warning'}>
                  {bill.status === 'PAID' ? 'Paga' : 'Pendente'}
                </span>
              </TableCell>
              <TableCell>
                {bill.status === 'PENDING' ? (
                  <Button disabled={loadingId === bill.id} onClick={() => handleMark(bill.id, BillStatus.PAID)}>
                    Marcar como paga
                  </Button>
                ) : (
                  <Button variant="outline" disabled={loadingId === bill.id} onClick={() => handleMark(bill.id, BillStatus.PENDING)}>
                    Marcar como pendente
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
