import { NextResponse } from 'next/server';
import { getDemoHistory, useDemoApi } from '@/lib/demo-data';

export async function GET() {
  if (!useDemoApi()) {
    const backend = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '');
    const res = await fetch(`${backend}/api/history`, { cache: 'no-store' });
    return NextResponse.json(await res.json(), { status: res.status });
  }
  return NextResponse.json(getDemoHistory());
}
