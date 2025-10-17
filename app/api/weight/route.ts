import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { weightSchema } from '@/lib/validations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const weights = await prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } });
  return NextResponse.json(weights);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = weightSchema.safeParse({ ...body, weightKg: Number(body.weightKg) });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const weight = await prisma.weightLog.create({
    data: {
      userId: user.id,
      date: new Date(parsed.data.date),
      weightKg: parsed.data.weightKg
    }
  });
  return NextResponse.json(weight, { status: 201 });
}
