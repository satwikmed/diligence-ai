import { NextRequest, NextResponse } from 'next/server';
import { getDemoCompare } from '@/lib/demo-data';
import { getBackendUrl } from '@/lib/server-backend';

export async function GET(request: NextRequest) {
  const doc1 = request.nextUrl.searchParams.get('doc1');
  const doc2 = request.nextUrl.searchParams.get('doc2');
  if (!doc1 || !doc2) {
    return NextResponse.json({ detail: 'doc1 and doc2 required' }, { status: 400 });
  }

  const backend = getBackendUrl();
  if (backend) {
    const res = await fetch(`${backend}/api/compare?doc1=${doc1}&doc2=${doc2}`, { cache: 'no-store' });
    return NextResponse.json(await res.json(), { status: res.status });
  }

  const data = getDemoCompare(doc1, doc2);
  if (!data) return NextResponse.json({ detail: 'Documents not found' }, { status: 404 });
  return NextResponse.json(data);
}
