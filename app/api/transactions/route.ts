import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { transactionSchema } from '@/lib/validations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' }
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = transactionSchema.safeParse({
    ...body,
    amount: Number(body.amount)
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.flatten() }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      date: new Date(parsed.data.date),
      note: parsed.data.note
    }
  });

  return NextResponse.json(transaction, { status: 201 });
}
