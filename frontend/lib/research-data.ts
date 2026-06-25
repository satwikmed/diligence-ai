import fs from 'fs';
import path from 'path';
import { DEMO_COMPANIES, PRIOR_YEAR_SUFFIX } from '@/lib/demo-data';

type ResearchArtifact = {
  ticker: string;
  filing_delta?: Record<string, unknown>;
  contradictions?: {
    ticker: string;
    contradictions: Array<Record<string, unknown>>;
    call_excerpt_count?: number;
    source?: string;
    transcript_period?: string;
  };
  qa_chunks?: QaChunk[];
  current_source?: string;
  prior_source?: string;
};

export type QaChunk = {
  section_name: string;
  text: string;
  page_number?: number | null;
  materiality?: number;
};

function tickerFromDocumentId(documentId: string): string | null {
  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  if (!company) return null;
  return company.filename.split('_')[0];
}

function researchPath(ticker: string): string {
  return path.join(process.cwd(), 'public', 'research', `${ticker.toLowerCase()}-research.json`);
}

export function loadResearchArtifact(ticker: string): ResearchArtifact | null {
  const filePath = researchPath(ticker);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ResearchArtifact;
  } catch {
    return null;
  }
}

export function getResearchFilingDelta(documentId: string, compareId: string) {
  const ticker = tickerFromDocumentId(documentId);
  if (!ticker) return null;

  const artifact = loadResearchArtifact(ticker);
  const delta = artifact?.filing_delta;
  if (!delta) return null;

  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  const priorLabel =
    compareId.endsWith(PRIOR_YEAR_SUFFIX) && artifact?.prior_source
      ? `Prior 10-K (${artifact.prior_source})`
      : (delta.prior_label as string) || 'Prior 10-K';
  const currentLabel =
    artifact?.current_source
      ? `Current 10-K (${artifact.current_source})`
      : (delta.current_label as string) || `FY${company?.filing_year || 2024} 10-K`;

  return {
    document_id: documentId,
    compare_id: compareId,
    prior_label: priorLabel,
    current_label: currentLabel,
    ...delta,
    source: 'sec_filing_text',
  };
}

export function getResearchContradictions(documentId: string) {
  const ticker = tickerFromDocumentId(documentId);
  if (!ticker) return null;

  const artifact = loadResearchArtifact(ticker);
  const contradictions = artifact?.contradictions;
  if (!contradictions) return null;

  return {
    document_id: documentId,
    ...contradictions,
  };
}

export function getResearchQaChunks(documentId: string): QaChunk[] | null {
  const ticker = tickerFromDocumentId(documentId);
  if (!ticker) return null;
  const artifact = loadResearchArtifact(ticker);
  return artifact?.qa_chunks?.length ? artifact.qa_chunks : null;
}
