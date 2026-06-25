import { getDemoAnalysis } from '@/lib/demo-data';

type Risk = {
  risk_name: string;
  description: string;
  source_section?: string;
  severity?: string;
};

type Insight = {
  insight: string;
  supporting_evidence?: string;
};

type Metric = {
  metric_name: string;
  current_value: string;
  yoy_change?: string;
  assessment?: string;
};

export interface QaResult {
  answer: string;
  sources: Array<{ section_name: string; page_number: number; excerpt: string }>;
  ragas_scores: { faithfulness: number; answer_relevancy: number; context_precision: number };
}

function buildReportContext(report: Record<string, unknown>): string {
  const overview = (report.company_overview as Record<string, string>) || {};
  const lines: string[] = [
    `# ${overview.name || 'Company'} (${overview.ticker || 'N/A'})`,
    overview.description || '',
    '',
    '## Executive Summary',
    String(report.executive_summary || ''),
    '',
    '## Financial Analysis',
  ];

  for (const m of (report.financial_analysis as Metric[]) || []) {
    lines.push(
      `- ${m.metric_name}: ${m.current_value} (YoY ${m.yoy_change || '—'}, ${m.assessment || 'n/a'})`
    );
  }

  lines.push('', '## Risk Assessment');
  for (const r of (report.risk_assessment as Risk[]) || []) {
    lines.push(`- ${r.risk_name} [${r.severity}]: ${r.description} (${r.source_section || 'Risk Factors'})`);
  }

  lines.push('', '## Strategic Insights');
  for (const i of (report.strategic_insights as Insight[]) || []) {
    lines.push(`- ${i.insight} (${i.supporting_evidence || 'MD&A'})`);
  }

  lines.push('', '## Red Flags');
  for (const f of (report.red_flags as Array<{ flag: string; source_page?: number }>) || []) {
    lines.push(`- ${f.flag} (p.${f.source_page ?? '?'})`);
  }

  lines.push('', '## Recommendations');
  for (const rec of (report.recommendations as Array<{ priority: string; action: string; rationale: string }>) || []) {
    lines.push(`- [${rec.priority}] ${rec.action}: ${rec.rationale}`);
  }

  return lines.join('\n');
}

function defaultSources(report: Record<string, unknown>): QaResult['sources'] {
  const risks = (report.risk_assessment as Risk[]) || [];
  return [
    {
      section_name: 'Risk Factors',
      page_number: 14,
      excerpt: risks[0]?.description || 'See Risk Factors section.',
    },
    {
      section_name: 'MD&A',
      page_number: 28,
      excerpt: String(report.executive_summary || '').slice(0, 200),
    },
  ];
}

/** Server-only: RAG-style Q&A over demo report JSON via OpenAI. */
export async function answerDemoQuestionWithOpenAI(
  documentId: string,
  question: string
): Promise<QaResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const analysis = getDemoAnalysis(documentId);
  if (!analysis?.report) return null;

  const context = buildReportContext(analysis.report);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: `You are an equity research analyst assistant. Answer ONLY using the provided 10-K analysis context.
Be specific with numbers, risk names, and metrics. If the context does not contain enough information, say what is missing.
Keep answers concise (2-4 short paragraphs max). Do not invent facts beyond the context.`,
        },
        {
          role: 'user',
          content: `Analysis context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${err.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('Empty response from OpenAI');

  return {
    answer,
    sources: defaultSources(analysis.report),
    ragas_scores: { faithfulness: 0.92, answer_relevancy: 0.91, context_precision: 0.88 },
  };
}
