import { NextResponse } from 'next/server';
import { getDemoHistory } from '@/lib/demo-data';
import { getBackendUrl } from '@/lib/server-backend';

export async function GET() {
  const backend = getBackendUrl();
  if (backend) {
    const res = await fetch(`${backend}/api/history`, { cache: 'no-store' });
    return NextResponse.json(await res.json(), { status: res.status });
  }
  return NextResponse.json(getDemoHistory());
}
