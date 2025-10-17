import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  kind: z.enum(['IN', 'OUT'])
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      kind: parsed.data.kind
    }
  });
  return NextResponse.json(category, { status: 201 });
}
