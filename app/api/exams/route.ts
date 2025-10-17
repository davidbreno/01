import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';
import { extractTextFromFile } from '@/lib/exams';

const uploadDir = path.join(process.cwd(), 'uploads');

async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const exams = await prisma.examFile.findMany({
    where: { userId: user.id },
    include: { results: true, cycles: true },
    orderBy: { uploadedAt: 'desc' }
  });
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
  }
  await ensureUploadDir();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  const text = await extractTextFromFile(filePath, file.type);
  const exam = await prisma.examFile.create({
    data: {
      userId: user.id,
      filename: file.name,
      mimetype: file.type,
      bytes: buffer.length,
      storagePath: filePath,
      textExtracted: text
    }
  });
  return NextResponse.json(exam, { status: 201 });
}
