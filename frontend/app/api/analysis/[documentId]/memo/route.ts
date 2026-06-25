import { NextResponse } from 'next/server';
import { getDemoAnalysis } from '@/lib/demo-data';
import { buildInvestmentMemoPdf } from '@/lib/memo-pdf';
import { getBackendUrl } from '@/lib/server-backend';

export async function GET(_request: Request, { params }: { params: { documentId: string } }) {
  const backend = getBackendUrl();
  if (backend) {
    const res = await fetch(`${backend}/api/analysis/${params.documentId}/memo`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ detail: 'Memo generation failed' }, { status: res.status });
    }
    const blob = await res.arrayBuffer();
    const disposition = res.headers.get('content-disposition') || `attachment; filename="memo-${params.documentId}.pdf"`;
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
      },
    });
  }

  const analysis = getDemoAnalysis(params.documentId);
  if (!analysis?.report) {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  }

  const overview = analysis.report.company_overview as Record<string, string> | undefined;
  const companyName = overview?.name || 'Company';
  const ticker = overview?.ticker || 'MEMO';
  const pdf = buildInvestmentMemoPdf(analysis.report, companyName);

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${ticker}_investment_memo.pdf"`,
    },
  });
}
