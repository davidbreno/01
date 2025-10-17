import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { cycleSchema } from '@/lib/validations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cycles = await prisma.steroidCycle.findMany({
    where: { userId: user.id },
    include: { doses: true, exams: true },
    orderBy: { startDate: 'desc' }
  });
  return NextResponse.json(cycles);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = cycleSchema.safeParse({
    ...body,
    doses: body.doses?.map((dose: any) => ({
      ...dose,
      dosageMgPerWeek: Number(dose.dosageMgPerWeek)
    }))
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.flatten() }, { status: 400 });
  }
  let doses;
  try {
    doses = parsed.data.doses.map((dose) => ({
      compound: dose.compound,
      dosageMgPerWeek: dose.dosageMgPerWeek,
      scheduleJson: JSON.parse(dose.scheduleJson)
    }));
  } catch (error) {
    return NextResponse.json({ error: 'Cronograma inválido' }, { status: 400 });
  }
  const cycle = await prisma.steroidCycle.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      notes: parsed.data.notes,
      doses: {
        create: doses
      }
    },
    include: { doses: true }
  });
  return NextResponse.json(cycle, { status: 201 });
}
