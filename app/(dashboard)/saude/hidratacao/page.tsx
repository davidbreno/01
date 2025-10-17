import { prisma } from '@/lib/prisma';
import { WaterForm } from '@/components/health/water-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterIntakeWidget } from '@/components/health/water-intake-widget';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/session';

export default async function HidratacaoPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const logs = await prisma.waterLog.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } });
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTotal = logs
    .filter((log) => format(log.date, 'yyyy-MM-dd') === today)
    .reduce((acc, log) => acc + log.ml, 0);
  const weeklyAverage = logs.reduce((acc, log) => acc + log.ml, 0) / Math.max(1, logs.length);

  return (
    <>
      <div className="col-span-12">
        <WaterForm />
      </div>
      <Card className="col-span-12 md:col-span-6">
        <CardHeader>
          <CardTitle>Meta diária</CardTitle>
        </CardHeader>
        <CardContent>
          <WaterIntakeWidget value={todayTotal} goal={3000} />
        </CardContent>
      </Card>
      <Card className="col-span-12 md:col-span-6">
        <CardHeader>
          <CardTitle>Média por registro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold text-primary-700 dark:text-primary-200">{Math.round(weeklyAverage)} ml</p>
          <p className="text-sm text-grayui-500 dark:text-grayui-300">Baseado nos últimos {logs.length} lançamentos</p>
        </CardContent>
      </Card>
    </>
  );
}
