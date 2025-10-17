import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { exportSchema } from '@/lib/validations';
import path from 'path';
import { promises as fs } from 'fs';
import { financeToCsv, healthToCsv } from '@/lib/exporters';

async function ensureUploadDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const parsed = exportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const timestamp = Date.now();
  const filename = `${parsed.data.type.toLowerCase()}-${timestamp}.${parsed.data.format.toLowerCase()}`;
  const exportPath = path.join(process.cwd(), 'uploads', filename);
  await ensureUploadDir(path.dirname(exportPath));

  if (parsed.data.type === 'FINANCE') {
    const transactions = await prisma.transaction.findMany({ where: { userId: user.id }, include: { category: true } });
    const csv = financeToCsv(
      transactions.map((transaction) => ({
        date: transaction.date.toISOString(),
        type: transaction.type,
        category: transaction.category?.name,
        amount: transaction.amount.toString(),
        note: transaction.note ?? ''
      }))
    );
    await fs.writeFile(exportPath, csv);
  } else {
    const weights = await prisma.weightLog.findMany({ where: { userId: user.id } });
    const csv = healthToCsv(
      weights.map((weight) => ({
        date: weight.date.toISOString(),
        weight: weight.weightKg.toString()
      }))
    );
    await fs.writeFile(exportPath, csv);
  }

  await prisma.exportJob.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      format: parsed.data.format,
      status: 'COMPLETED',
      filePath: exportPath
    }
  });

  const file = await fs.readFile(exportPath);
  return new NextResponse(file, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
