'use client';

import { useEffect, useState } from 'react';
import SectionHeading from '@/components/ui/section-heading';
import { getContradictions } from '@/lib/api';

interface ContradictionPanelProps {
  documentId: string;
}

interface ContradictionItem {
  theme: string;
  severity: string;
  analysis: string;
  earnings_call?: { quote?: string; source?: string; speaker?: string };
  filing?: { quote?: string; source?: string };
}

export default function ContradictionPanel({ documentId }: ContradictionPanelProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getContradictions(documentId)
      .then(setData)
      .catch(() => setError('Could not load contradiction analysis.'))
      .finally(() => setLoading(false));
  }, [documentId]);

  const items = (data?.contradictions as ContradictionItem[]) || [];
  const source = String(data?.source || '');
  const isResearch = source === 'transcript_vs_filing_text';

  return (
    <section>
      <SectionHeading label="Cross-check" title="Earnings Call vs 10-K Contradictions" />
      <div className="glass-card p-6">
        {isResearch && (
          <p className="mb-4 text-xs text-white/50">
            Cross-checks representative earnings-call excerpts against extracted Risk Factors / MD&A text from the 10-K.
            {data?.transcript_period ? ` (${String(data.transcript_period)})` : ''}
          </p>
        )}
        {loading && <p className="text-sm text-white/50">Scanning for contradictions...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && !error && items.map((item, i) => (
          <div key={i} className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-medium text-white">{item.theme}</span>
              <span className={`badge ${item.severity === 'high' ? 'badge-danger' : item.severity === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                {item.severity}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <blockquote className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm">
                <p className="mb-1 text-xs uppercase text-cyan-300/80">Earnings call</p>
                <p className="text-white/80">&ldquo;{item.earnings_call?.quote}&rdquo;</p>
                <p className="mt-2 text-xs text-white/45">{item.earnings_call?.source} · {item.earnings_call?.speaker}</p>
              </blockquote>
              <blockquote className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm">
                <p className="mb-1 text-xs uppercase text-amber-300/80">10-K filing</p>
                <p className="text-white/80">&ldquo;{item.filing?.quote}&rdquo;</p>
                <p className="mt-2 text-xs text-white/45">{item.filing?.source}</p>
              </blockquote>
            </div>
            <p className="mt-3 text-sm text-white/65">{item.analysis}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
