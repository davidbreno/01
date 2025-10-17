import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightForm } from '@/components/health/weight-form';
import { WeightChart } from '@/components/health/weight-chart';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getCurrentUser } from '@/lib/session';

export default async function PesoPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const weights = await prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } });
  const data = weights.map((weight) => ({
    date: format(weight.date, 'dd MMM', { locale: ptBR }),
    weight: Number(weight.weightKg)
  }));

  return (
    <>
      <div className="col-span-12">
        <WeightForm />
      </div>
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart data={data} />
        </CardContent>
      </Card>
    </>
  );
}
