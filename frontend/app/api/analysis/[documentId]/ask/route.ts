import { NextRequest, NextResponse } from 'next/server';
import { getDemoAnswer } from '@/lib/demo-data';
import { answerDemoQuestionWithOpenAI } from '@/lib/openai-qa';
import { getBackendUrl } from '@/lib/server-backend';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const body = await request.json();
  const question = String(body?.question || '').trim();
  if (!question) {
    return NextResponse.json({ detail: 'question required' }, { status: 400 });
  }

  const backend = getBackendUrl();
  if (backend) {
    const res = await fetch(`${backend}/api/analysis/${params.documentId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  }

  try {
    const llm = await answerDemoQuestionWithOpenAI(params.documentId, question);
    if (llm) {
      return NextResponse.json(llm);
    }
  } catch (err) {
    console.error('OpenAI Q&A error:', err);
    return NextResponse.json(
      { detail: 'Q&A temporarily unavailable. Check OPENAI_API_KEY on the server.' },
      { status: 503 }
    );
  }

  return NextResponse.json(getDemoAnswer(params.documentId, question));
}
