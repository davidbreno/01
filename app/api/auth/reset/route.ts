import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const { email } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: 'Se o e-mail estiver cadastrado enviaremos instruções.' });
  }
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const token = await createPasswordResetToken(user.id);
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset/confirm?token=${token}`;

  if (process.env.NODE_ENV !== 'production') {
    console.info('[PasswordReset] token gerado', { email, resetLink });
  }

  await writeAuditLog({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUEST',
    entity: 'User',
    entityId: user.id,
    ip: request.headers.get('x-forwarded-for')
  });

  return NextResponse.json({ message: 'Se o e-mail estiver cadastrado enviaremos instruções.', resetLink: process.env.NODE_ENV === 'production' ? undefined : resetLink });
}
