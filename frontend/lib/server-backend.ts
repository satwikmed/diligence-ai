import { shouldUseDemoData } from '@/lib/demo-data';

/** Server-side backend URL for Next.js API route proxies. */
export function getBackendUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url || shouldUseDemoData()) return null;
  return url.replace(/\/$/, '');
}
