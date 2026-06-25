import { getDemoAnalysis } from '@/lib/demo-data';
import { getResearchQaChunks, type QaChunk } from '@/lib/research-data';
import { heuristicRagasScores } from '@/lib/ragas-heuristic';

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

function retrieveChunks(chunks: QaChunk[], question: string, topK = 5): QaChunk[] {
  const terms = question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  return [...chunks]
    .map((chunk) => {
      const lower = chunk.text.toLowerCase();
      const termHits = terms.reduce((n, t) => n + (lower.includes(t) ? 1 : 0), 0);
      const score = termHits * 2 + (chunk.materiality || 0);
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.chunk);
}

function chunksToSources(chunks: QaChunk[]): QaResult['sources'] {
  return chunks.map((c) => ({
    section_name: c.section_name,
    page_number: typeof c.page_number === 'number' ? c.page_number : 0,
    excerpt: c.text.slice(0, 320) + (c.text.length > 320 ? '…' : ''),
  }));
}

function fallbackSources(report: Record<string, unknown>): QaResult['sources'] {
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

/** Server-only: RAG over extracted 10-K chunks + report JSON via OpenAI. */
export async function answerDemoQuestionWithOpenAI(
  documentId: string,
  question: string
): Promise<QaResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const analysis = getDemoAnalysis(documentId);
  if (!analysis?.report) return null;

  const reportContext = buildReportContext(analysis.report);
  const allChunks = getResearchQaChunks(documentId) || [];
  const retrieved = retrieveChunks(allChunks, question);
  const filingContext =
    retrieved.length > 0
      ? retrieved
          .map(
            (c, i) =>
              `[Filing excerpt ${i + 1} — ${c.section_name}${c.page_number ? ` p.${c.page_number}` : ''}]\n${c.text}`
          )
          .join('\n\n')
      : '';

  const context = filingContext
    ? `${reportContext}\n\n## Extracted 10-K text (retrieved for this question)\n${filingContext}`
    : reportContext;

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
          content: `You are an equity research analyst assistant. Answer ONLY using the provided 10-K analysis and filing excerpts.
Be specific with numbers, risk names, and metrics. Cite Risk Factors or MD&A when quoting filing language.
If the context does not contain enough information, say what is missing.
Keep answers concise (2-4 short paragraphs max). Do not invent facts beyond the context.`,
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${question}`,
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

  const contextStrings = retrieved.length > 0 ? retrieved.map((c) => c.text) : [reportContext];
  const sources = retrieved.length > 0 ? chunksToSources(retrieved) : fallbackSources(analysis.report);

  return {
    answer,
    sources,
    ragas_scores: heuristicRagasScores(question, answer, contextStrings),
  };
}
