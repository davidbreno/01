import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { waterSchema } from '@/lib/validations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const waters = await prisma.waterLog.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } });
  return NextResponse.json(waters);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = waterSchema.safeParse({ ...body, ml: Number(body.ml) });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const water = await prisma.waterLog.create({
    data: {
      userId: user.id,
      date: new Date(parsed.data.date),
      ml: parsed.data.ml
    }
  });
  return NextResponse.json(water, { status: 201 });
}
