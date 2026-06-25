import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/server-backend';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const backend = getBackendUrl();
  if (!backend) {
    return NextResponse.json(
      {
        detail:
          'Upload requires a deployed backend. Set NEXT_PUBLIC_API_URL on Vercel to your Render API URL.',
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const res = await fetch(`${backend}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return new NextResponse(text, { status: res.status });
  }
}
