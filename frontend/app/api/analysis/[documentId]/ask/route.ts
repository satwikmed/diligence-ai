import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/server-backend';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json(
      { detail: 'Q&A requires backend in production demo mode uses client stubs' },
      { status: 501 }
    );
  }

  const body = await request.json();
  const res = await fetch(`${backend}/api/analysis/${params.documentId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
