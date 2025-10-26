import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const { token, password } = result.data;
  const reset = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });
  if (!reset?.user) {
    return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 });
  }
  const hashed = await hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.user.id }, data: { password: hashed } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: reset.user.id } })
  ]);
  await writeAuditLog({
    userId: reset.user.id,
    action: 'PASSWORD_RESET',
    entity: 'User',
    entityId: reset.user.id,
    ip: request.headers.get('x-forwarded-for')
  });
  return NextResponse.json({ message: 'Senha atualizada com sucesso' });
}
