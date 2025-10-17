import { prisma } from '@/lib/prisma';
import { ReportsView } from '@/components/finance/reports-view';
import { getCurrentUser } from '@/lib/session';

export default async function RelatoriosPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  const data = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    category: transaction.category?.name ?? 'Sem categoria',
    date: transaction.date
  }));

  return <ReportsView data={data} />;
}
