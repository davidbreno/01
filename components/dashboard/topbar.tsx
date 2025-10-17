'use client';

import { Search, CalendarRange, Download, SunMedium, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { CalendarRangePicker } from '@/components/forms/calendar-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Topbar() {
  const { setTheme, theme } = useTheme();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between rounded-2xl border border-white/20 bg-white/60 px-8 shadow-soft backdrop-blur dark:bg-grayui-800/60">
      <div className="flex w-1/2 items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-grayui-400" />
          <Input className="pl-10" placeholder="Buscar" aria-label="Buscar" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              {dateRange ? `${format(dateRange.from, "dd MMM", { locale: ptBR })} - ${format(dateRange.to, "dd MMM", { locale: ptBR })}` : 'Período'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <CalendarRangePicker value={dateRange} onChange={setDateRange} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button
          variant="ghost"
          aria-label="Alternar tema"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Avatar>
          <AvatarFallback>DV</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
