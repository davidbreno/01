import { prisma } from '@/lib/prisma';
import { SteroidCycleForm } from '@/components/health/steroid-cycle-form';
import { SteroidCycleTable } from '@/components/health/steroid-cycle-table';
import { getCurrentUser } from '@/lib/session';

export default async function CiclosPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const cycles = await prisma.steroidCycle.findMany({
    where: { userId: user.id },
    include: { doses: true },
    orderBy: { startDate: 'desc' }
  });

  const rows = cycles.map((cycle) => {
    const totalMg = cycle.doses.reduce((acc, dose) => acc + dose.dosageMgPerWeek, 0);
    const alerts: string[] = [];
    if (cycle.startDate > cycle.endDate) {
      alerts.push('Datas inválidas');
    }
    if (cycle.doses.length < 2) {
      alerts.push('Adicione pelo menos dois compostos');
    }
    return {
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.startDate.toISOString(),
      endDate: cycle.endDate.toISOString(),
      totalMg,
      compounds: cycle.doses.length,
      alerts
    };
  });

  return (
    <>
      <div className="col-span-12">
        <SteroidCycleForm />
      </div>
      <div className="col-span-12">
        <SteroidCycleTable data={rows} />
      </div>
    </>
  );
}
