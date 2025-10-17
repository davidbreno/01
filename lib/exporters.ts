import { stringify } from 'csv-stringify/sync';

export type FinanceRow = {
  date: string;
  type: string;
  category?: string | null;
  amount: string;
  note?: string | null;
};

export type HealthRow = {
  date: string;
  weight: string;
};

export function financeToCsv(rows: FinanceRow[]): string {
  return stringify(rows, {
    header: true,
    columns: ['date', 'type', 'category', 'amount', 'note']
  });
}

export function healthToCsv(rows: HealthRow[]): string {
  return stringify(rows, {
    header: true,
    columns: ['date', 'weight']
  });
}
