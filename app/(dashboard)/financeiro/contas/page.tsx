import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BillForm } from '@/components/finance/bill-form';
import { BillsTable } from '@/components/finance/bills-table';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getCurrentUser } from '@/lib/session';

export default async function ContasPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const bills = await prisma.bill.findMany({ where: { userId: user.id }, orderBy: { dueDate: 'asc' } });

  const tableData = bills.map((bill) => ({
    id: bill.id,
    title: bill.title,
    amount: Number(bill.amount),
    dueDate: format(bill.dueDate, 'dd/MM', { locale: ptBR }),
    status: bill.status
  }));

  return (
    <>
      <div className="col-span-12">
        <BillForm />
      </div>
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <BillsTable data={tableData} />
        </CardContent>
      </Card>
    </>
  );
}
