import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function currencyFormat(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function percentFormat(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
export const FIFTEEN_DAYS_IN_MS = 15 * 24 * 60 * 60 * 1000;

export const STORAGE_STRATEGY = process.env.NODE_ENV === 'production' ? 's3' : 'local';
