/** Same-origin API when unset; set NEXT_PUBLIC_API_URL to your deployed backend on Vercel. */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  return '';
}

export function getWsUrl(): string {
  const url = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (url) return url.replace(/\/$/, '');
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
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(apiPath('/api/upload'), { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function getAnalysisStatus(documentId: string): Promise<AnalysisStatus> {
  const res = await fetch(apiPath(`/api/analysis/${documentId}/status`));
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function getAnalysis(documentId: string): Promise<AnalysisReport> {
  const res = await fetch(apiPath(`/api/analysis/${documentId}`));
  if (!res.ok) throw new Error('Failed to fetch analysis');
  return res.json();
}

export async function askQuestion(documentId: string, question: string) {
  const res = await fetch(apiPath(`/api/analysis/${documentId}/ask`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Question failed');
  return res.json();
}

export async function getHistory() {
  const res = await fetch(apiPath('/api/history'));
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteAnalysis(documentId: string) {
  const res = await fetch(apiPath(`/api/history/${documentId}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function compareCompanies(doc1: string, doc2: string) {
  const res = await fetch(apiPath(`/api/compare?doc1=${doc1}&doc2=${doc2}`));
  if (!res.ok) throw new Error('Compare failed');
  return res.json();
}

export async function getAgentLogs(documentId: string) {
  const res = await fetch(apiPath(`/api/agent-logs/${documentId}`));
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function getSuggestedQuestions(documentId: string) {
  const res = await fetch(apiPath(`/api/analysis/${documentId}/suggested-questions`));
  if (!res.ok) return { questions: [] };
  return res.json();
}
