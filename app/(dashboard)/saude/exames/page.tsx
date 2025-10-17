import { prisma } from '@/lib/prisma';
import { ExamUploader } from '@/components/health/exam-uploader';
import { ExamReaderButton } from '@/components/health/exam-reader-button';
import { ExamResultsTable } from '@/components/health/exam-results-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/session';

export default async function ExamesPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="col-span-12">Configure um usuário.</div>;
  const exams = await prisma.examFile.findMany({
    where: { userId: user.id },
    include: { results: true, cycles: true },
    orderBy: { uploadedAt: 'desc' }
  });

  return (
    <>
      <div className="col-span-12">
        <ExamUploader />
      </div>
      {exams.map((exam) => (
        <Card key={exam.id} className="col-span-12">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>{exam.filename}</CardTitle>
              <p className="text-xs text-grayui-500">Associado a {exam.cycles.length} ciclo(s)</p>
            </div>
            <div className="flex items-center gap-2">
              {exam.results.some((result) => result.isOutOfRange) && <Badge className="bg-danger/20 text-danger">Atenção</Badge>}
              <ExamReaderButton examId={exam.id} />
            </div>
          </CardHeader>
          <CardContent>
            <ExamResultsTable
              data={exam.results.map((result) => ({
                id: result.id,
                marker: result.marker,
                value: result.value,
                unit: result.unit,
                referenceMin: result.referenceMin,
                referenceMax: result.referenceMax,
                isOutOfRange: result.isOutOfRange
              }))}
            />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
