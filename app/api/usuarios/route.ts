import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  return NextResponse.json(usuarios);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
