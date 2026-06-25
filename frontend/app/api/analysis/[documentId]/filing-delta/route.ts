import { NextRequest, NextResponse } from 'next/server';
import { getDemoFilingDelta } from '@/lib/demo-data';
import { getResearchFilingDelta } from '@/lib/research-data';
import { getBackendUrl } from '@/lib/server-backend';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const compareId = request.nextUrl.searchParams.get('compare_id');
  if (!compareId) {
    return NextResponse.json({ detail: 'compare_id required' }, { status: 400 });
  }

  const backend = getBackendUrl();
  if (backend) {
    const res = await fetch(
      `${backend}/api/analysis/${params.documentId}/filing-delta?compare_id=${compareId}`,
      { cache: 'no-store' }
    );
    return NextResponse.json(await res.json(), { status: res.status });
  }

  const research = getResearchFilingDelta(params.documentId, compareId);
  if (research) return NextResponse.json(research);

  const data = getDemoFilingDelta(params.documentId, compareId);
  if (!data) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
