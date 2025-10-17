'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ExamReaderButton({ examId, onParsed }: { examId: string; onParsed?: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/exams/${examId}/read`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Erro ao ler exame');
      }
      router.refresh();
      onParsed?.();
    } catch (error) {
      console.error(error);
      alert('Não foi possível ler o exame');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Processando...' : 'Ler exames'}
    </Button>
  );
}
