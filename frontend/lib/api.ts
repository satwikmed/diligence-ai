import {
  getDemoAnalysis,
  getDemoCompare,
  getDemoHistory,
  shouldUseDemoData,
} from '@/lib/demo-data';

/** Same-origin API when unset; set NEXT_PUBLIC_API_URL to your deployed backend on Vercel. */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) return '';
  return url.replace(/\/$/, '');
}

export function getWsUrl(): string {
  const url = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}`;
  }
  return 'ws://localhost:8000';
}

function apiPath(path: string): string {
  const base = getApiUrl();
  return base ? `${base}${path}` : path;
}

export interface UploadResponse {
  document_id: string;
  status: string;
  filename: string;
}

export interface AnalysisStatus {
  document_id: string;
  status: string;
  current_agent: string | null;
  progress_percentage: number;
  estimated_time_remaining: number;
  last_message: string;
}

export interface AnalysisReport {
  document_id: string;
  status: string;
  report: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  if (shouldUseDemoData()) {
    throw new Error('Upload requires a deployed backend. Set NEXT_PUBLIC_API_URL on Vercel.');
  }
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(apiPath('/api/upload'), { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function getAnalysisStatus(documentId: string): Promise<AnalysisStatus> {
  if (shouldUseDemoData()) {
    const data = getDemoAnalysis(documentId);
    if (!data) throw new Error('Document not found');
    return {
      document_id: documentId,
      status: 'complete',
      current_agent: null,
      progress_percentage: 100,
      estimated_time_remaining: 0,
      last_message: 'Analysis complete',
    };
  }
  const res = await fetch(apiPath(`/api/analysis/${documentId}/status`));
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function getAnalysis(documentId: string): Promise<AnalysisReport> {
  if (shouldUseDemoData()) {
    const data = getDemoAnalysis(documentId);
    if (!data) throw new Error('Document not found');
    return data;
  }
  const res = await fetch(apiPath(`/api/analysis/${documentId}`));
  if (!res.ok) throw new Error('Failed to fetch analysis');
  return res.json();
}

export async function askQuestion(documentId: string, question: string) {
  if (shouldUseDemoData()) {
    return {
      answer: `Based on the 10-K filing, ${question.replace('?', '')} is addressed in the Risk Factors and MD&A sections. Key themes include competitive pressure, regulatory exposure, and margin sustainability.`,
      sources: [{ section_name: 'Risk Factors', page_number: 12, excerpt: 'See filing discussion.' }],
      ragas_scores: { faithfulness: 0.88, answer_relevancy: 0.9, context_precision: 0.85 },
    };
  }
  const res = await fetch(apiPath(`/api/analysis/${documentId}/ask`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Question failed');
  return res.json();
}

export async function getHistory() {
  if (shouldUseDemoData()) {
    return getDemoHistory();
  }
  const res = await fetch(apiPath('/api/history'));
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteAnalysis(documentId: string) {
  if (shouldUseDemoData()) {
    return { deleted: true, document_id: documentId };
  }
  const res = await fetch(apiPath(`/api/history/${documentId}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function compareCompanies(doc1: string, doc2: string) {
  if (shouldUseDemoData()) {
    const data = getDemoCompare(doc1, doc2);
    if (!data) throw new Error('Compare failed');
    return data;
  }
  const res = await fetch(apiPath(`/api/compare?doc1=${doc1}&doc2=${doc2}`));
  if (!res.ok) throw new Error('Compare failed');
  return res.json();
}

export async function getAgentLogs(documentId: string) {
  if (shouldUseDemoData()) {
    return { logs: [] };
  }
  const res = await fetch(apiPath(`/api/agent-logs/${documentId}`));
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function getSuggestedQuestions(documentId: string) {
  if (shouldUseDemoData()) {
    return {
      questions: [
        'What are the top 3 risks I should worry about?',
        'How is revenue growth trending year over year?',
        'What is management saying about competitive threats?',
      ],
    };
  }
  const res = await fetch(apiPath(`/api/analysis/${documentId}/suggested-questions`));
  if (!res.ok) return { questions: [] };
  return res.json();
}
