import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { extractTextFromFile, saveExamResults } from '@/lib/exams';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const exam = await prisma.examFile.findUnique({ where: { id: params.id, userId: user.id } });
  if (!exam) {
    return NextResponse.json({ error: 'Exame não encontrado' }, { status: 404 });
  }
  const text = exam.textExtracted || (await extractTextFromFile(exam.storagePath, exam.mimetype));
  const parsed = await saveExamResults(exam.id, text);
  await prisma.examFile.update({
    where: { id: exam.id },
    data: { textExtracted: text }
  });
  return NextResponse.json(parsed);
}
