'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export function ExamUploader({ onUploaded }: { onUploaded?: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      setLoading(true);
      try {
        const response = await fetch('/api/exams', {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          throw new Error('Upload falhou');
        }
        router.refresh();
        onUploaded?.();
      } catch (error) {
        console.error(error);
        alert('Não foi possível enviar o exame');
      } finally {
        setLoading(false);
      }
    },
    [onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'application/pdf': ['.pdf'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de exames</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/40 px-6 py-12 text-center text-sm"
        >
          <input {...getInputProps()} />
          {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte PDF/Imagem ou clique para selecionar'}
        </div>
        <Button className="mt-4" disabled={loading} type="button" onClick={open}>
          {loading ? 'Enviando...' : 'Enviar arquivo'}
        </Button>
      </CardContent>
    </Card>
  );
}
