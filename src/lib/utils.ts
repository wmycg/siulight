import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
export function formatDate(value: string, year = true) {
  return new Intl.DateTimeFormat('zh-CN', {
    ...(year ? { year: 'numeric' as const } : {}),
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(`${value.slice(0, 10)}T12:00:00+08:00`));
}
