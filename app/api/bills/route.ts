import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { billSchema } from '@/lib/validations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bills = await prisma.bill.findMany({ where: { userId: user.id }, orderBy: { dueDate: 'asc' } });
  return NextResponse.json(bills);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = billSchema.safeParse({ ...body, amount: Number(body.amount) });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const bill = await prisma.bill.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      amount: parsed.data.amount,
      dueDate: new Date(parsed.data.dueDate),
      status: parsed.data.status
    }
  });
  return NextResponse.json(bill, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { id, status } = body as { id: string; status: 'PENDING' | 'PAID' };
  const bill = await prisma.bill.update({
    where: { id, userId: user.id },
    data: { status }
  });
  return NextResponse.json(bill);
}
