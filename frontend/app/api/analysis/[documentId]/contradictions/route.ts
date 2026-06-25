import { NextRequest, NextResponse } from 'next/server';
import { getDemoContradictions } from '@/lib/demo-data';
import { getBackendUrl } from '@/lib/server-backend';

export async function GET(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const backend = getBackendUrl();
  if (backend) {
    const res = await fetch(`${backend}/api/analysis/${params.documentId}/contradictions`, { cache: 'no-store' });
    return NextResponse.json(await res.json(), { status: res.status });
  }
  const data = getDemoContradictions(params.documentId);
  if (!data) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
