import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionForm } from '@/components/finance/transaction-form';
import { TransactionsTable } from '@/components/finance/transactions-table';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getCurrentUser } from '@/lib/session';

export default async function EntradasSaidasPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  const tableData = transactions.map((transaction) => ({
    id: transaction.id,
    date: format(transaction.date, 'dd/MM/yyyy', { locale: ptBR }),
    category: transaction.category?.name ?? 'Sem categoria',
    type: transaction.type,
    amount: Number(transaction.amount),
    note: transaction.note
  }));

  return (
    <>
      <div className="col-span-12">
        <TransactionForm />
      </div>
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable data={tableData} />
        </CardContent>
      </Card>
    </>
  );
}
