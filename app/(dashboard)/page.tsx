import { prisma } from '@/lib/prisma';
import { addDays, eachDayOfInterval, format, subDays } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currencyFormat, FIFTEEN_DAYS_IN_MS } from '@/lib/utils';
import { BalanceAreaChart } from '@/components/dashboard/balance-area-chart';
import { CategoryBarChart } from '@/components/dashboard/category-bar-chart';
import { Sparkline } from '@/components/dashboard/sparkline';
import { WaterIntakeWidget } from '@/components/health/water-intake-widget';
import { WeightChart } from '@/components/health/weight-chart';
import { AlertBanner } from '@/components/notifications/alert-banner';
import { ExportButton } from '@/components/ui/export-button';
import { getCurrentUser } from '@/lib/session';

async function getDashboardData(userId: string) {
  const [transactions, bills, weightLogs, waterLogs, examResults] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'asc' }
    }),
    prisma.bill.findMany({ where: { userId } }),
    prisma.weightLog.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    prisma.waterLog.findMany({ where: { userId } }),
    prisma.examResult.findMany({
      where: {
        exam: { userId }
      }
    })
  ]);

  return { transactions, bills, weightLogs, waterLogs, examResults };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div className="col-span-12">Configure um usuário.</div>;
  }
  const { transactions, bills, weightLogs, waterLogs, examResults } = await getDashboardData(user.id);

  const totalIn = transactions.filter((t) => t.type === 'IN').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalOut = transactions.filter((t) => t.type === 'OUT').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIn - totalOut;

  const start = subDays(new Date(), 14);
  const dailyBalance = eachDayOfInterval({ start, end: new Date() }).map((date) => {
    const formatted = format(date, 'dd MMM', { locale: ptBR });
    const dayTransactions = transactions.filter((transaction) => format(transaction.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    const dayTotal = dayTransactions.reduce((acc, transaction) => acc + (transaction.type === 'IN' ? Number(transaction.amount) : -Number(transaction.amount)), 0);
    return { date: formatted, saldo: dayTotal };
  });

  const groupedByCategory = transactions.reduce<Record<string, { in: number; out: number }>>((acc, transaction) => {
    const key = transaction.category?.name ?? 'Outros';
    if (!acc[key]) {
      acc[key] = { in: 0, out: 0 };
    }
    if (transaction.type === 'IN') {
      acc[key].in += Number(transaction.amount);
    } else {
      acc[key].out += Number(transaction.amount);
    }
    return acc;
  }, {});

  const categoryData = Object.entries(groupedByCategory).map(([categoria, values]) => ({
    categoria,
    entrada: values.in,
    saida: values.out
  }));

  const sparklineData = transactions.slice(-7).map((transaction) => ({ value: Number(transaction.amount) }));

  const waterToday = waterLogs
    .filter((log) => format(log.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((acc, log) => acc + log.ml, 0);

  const waterGoal = 3000;

  const weightChartData = weightLogs.map((log) => ({
    date: format(log.date, 'dd MMM', { locale: ptBR }),
    weight: Number(log.weightKg)
  }));

  const lastWeightLog = weightLogs.at(-1);
  const alerts = [] as Array<{ id: string; title: string; description: string; tone: 'warning' | 'danger' | 'info'; icon?: 'alert' | 'water' | 'weight' | 'bell' }>;
  if (lastWeightLog && Date.now() - lastWeightLog.date.getTime() > FIFTEEN_DAYS_IN_MS) {
    alerts.push({
      id: 'weight-reminder',
      title: 'Registre seu peso',
      description: 'Já se passaram mais de 15 dias desde a última pesagem.',
      tone: 'warning',
      icon: 'weight'
    });
  }

  const pendingBills = bills.filter((bill) => bill.status === 'PENDING' && bill.dueDate < addDays(new Date(), 3));
  if (pendingBills.length) {
    alerts.push({
      id: 'bills',
      title: 'Contas próximas do vencimento',
      description: `${pendingBills.length} conta(s) vencendo em breve`,
      tone: 'danger',
      icon: 'bell'
    });
  }

  const outOfRangeExams = examResults.filter((result) => result.isOutOfRange);
  if (outOfRangeExams.length) {
    alerts.push({
      id: 'exams-alert',
      title: 'Exames fora da faixa',
      description: `${outOfRangeExams.length} marcador(es) requerem atenção`,
      tone: 'danger',
      icon: 'alert'
    });
  }

  return (
    <>
      <AlertBanner messages={alerts} />
      <Card className="col-span-12 lg:col-span-8">
        <CardHeader>
          <CardTitle>Saldo semanal</CardTitle>
          <ExportButton payload={{ type: 'FINANCE', range: 'weekly' }} />
        </CardHeader>
        <CardContent>
          <BalanceAreaChart data={dailyBalance} />
        </CardContent>
      </Card>
      <Card className="col-span-12 lg:col-span-4">
        <CardHeader>
          <CardTitle>KPIs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-primary-100/60 p-4">
            <p className="text-xs uppercase text-primary-700">Total entradas</p>
            <p className="text-2xl font-semibold text-primary-900">{currencyFormat(totalIn)}</p>
            <Sparkline data={sparklineData} color="#147a57" />
          </div>
          <div className="rounded-xl bg-grayui-100/80 p-4 dark:bg-grayui-800/80">
            <p className="text-xs uppercase text-grayui-500">Total saídas</p>
            <p className="text-2xl font-semibold text-grayui-700 dark:text-grayui-100">{currencyFormat(totalOut)}</p>
            <Sparkline data={sparklineData} color="#f59e0b" />
          </div>
          <div className="rounded-xl bg-primary-gradient p-4 text-white shadow-soft">
            <p className="text-xs uppercase">Saldo</p>
            <p className="text-2xl font-semibold">{currencyFormat(balance)}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader>
          <CardTitle>Categoria por período</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBarChart data={categoryData} />
        </CardContent>
      </Card>
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader>
          <CardTitle>Hidratação</CardTitle>
        </CardHeader>
        <CardContent>
          <WaterIntakeWidget value={waterToday} goal={waterGoal} />
        </CardContent>
      </Card>
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Evolução de peso</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart data={weightChartData} />
        </CardContent>
      </Card>
    </>
  );
}
