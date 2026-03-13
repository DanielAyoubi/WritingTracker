import { format, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(isoStr: string): string {
  try {
    return format(parseISO(isoStr), 'MMM d, yyyy HH:mm');
  } catch {
    return isoStr;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function formatWords(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
