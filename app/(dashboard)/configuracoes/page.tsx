'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [waterGoal, setWaterGoal] = useState(3000);

  return (
    <div className="col-span-12 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span>Modo escuro</span>
          <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <label className="flex items-center justify-between">
            Meta diária de água
            <input
              type="number"
              value={waterGoal}
              onChange={(event) => setWaterGoal(Number(event.target.value))}
              className="w-24 rounded-2xl border border-grayui-100 px-3 py-1"
            />
          </label>
          <p className="text-xs text-grayui-500">A meta é armazenada localmente e usada nos widgets de hidratação.</p>
        </CardContent>
      </Card>
    </div>
  );
}
