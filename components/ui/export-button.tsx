'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExportButton({ payload }: { payload: Record<string, unknown> }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Erro ao exportar');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'export.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Falha na exportação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {loading ? 'Exportando...' : 'Exportar'}
    </Button>
  );
}
