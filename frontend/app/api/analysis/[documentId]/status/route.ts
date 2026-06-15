import { NextRequest, NextResponse } from 'next/server';
import { getDemoAnalysis, useDemoApi } from '@/lib/demo-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const { documentId } = params;

  if (!useDemoApi()) {
    const backend = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '');
    const res = await fetch(`${backend}/api/analysis/${documentId}/status`, { cache: 'no-store' });
    return NextResponse.json(await res.json(), { status: res.status });
  }

  const data = getDemoAnalysis(documentId);
  if (!data) return NextResponse.json({ detail: 'Document not found' }, { status: 404 });
  return NextResponse.json({
    document_id: documentId,
    status: 'complete',
    current_agent: null,
    progress_percentage: 100,
    estimated_time_remaining: 0,
    last_message: 'Analysis complete',
  });
}
