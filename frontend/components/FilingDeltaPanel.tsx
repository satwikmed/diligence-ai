'use client';

import { useEffect, useState } from 'react';
import SectionHeading from '@/components/ui/section-heading';
import { getFilingDelta, getHistory } from '@/lib/api';
import { PRIOR_YEAR_SUFFIX } from '@/lib/demo-data';

interface FilingDeltaPanelProps {
  documentId: string;
}

export default function FilingDeltaPanel({ documentId }: FilingDeltaPanelProps) {
  const [compareId, setCompareId] = useState('');
  const [options, setOptions] = useState<Array<{ document_id: string; company_name: string }>>([]);
  const [delta, setDelta] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory()
      .then((data) => {
        const completed = (data.items || []).filter(
          (i: { document_id: string; processing_status: string }) =>
            i.processing_status === 'complete' && i.document_id !== documentId
        );
        const priorOption = {
          document_id: `${documentId}${PRIOR_YEAR_SUFFIX}`,
          company_name: 'Prior year 10-K (same company)',
        };
        setOptions([priorOption, ...completed]);
        setCompareId(priorOption.document_id);
      })
      .catch(() => setError('Could not load comparison filings.'));
  }, [documentId]);

  useEffect(() => {
    if (!compareId) return;
    setLoading(true);
    setError('');
    getFilingDelta(documentId, compareId)
      .then(setDelta)
      .catch(() => {
        setError('Could not compute filing delta.');
        setDelta(null);
      })
      .finally(() => setLoading(false));
  }, [documentId, compareId]);

  const sections = (delta?.sections as Array<Record<string, unknown>>) || [];
  const headlines = (delta?.headline_changes as Array<Record<string, string>>) || [];

  return (
    <section>
      <SectionHeading label="QoQ" title="Filing Delta (Risk Factors & MD&A)" />
      <div className="glass-card p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-white/60">Compare against:</label>
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            className="input-glass min-w-[220px]"
          >
            {options.map((o) => (
              <option key={o.document_id} value={o.document_id}>{o.company_name}</option>
            ))}
          </select>
          {delta && (
            <span className="badge badge-primary">
              Change score: {String(delta.overall_change_score)}%
            </span>
          )}
        </div>

        {loading && <p className="text-sm text-white/50">Computing delta...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {headlines.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">Headline changes</p>
            {headlines.map((h, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <span className={`badge mr-2 ${h.type === 'added' ? 'badge-success' : 'badge-warning'}`}>
                  {h.type}
                </span>
                <span className="text-white/80">{h.text}</span>
                <p className="mt-1 text-xs text-white/45">[{h.citation}] · {h.section}</p>
              </div>
            ))}
          </div>
        )}

        {sections.map((section) => (
          <div key={String(section.section)} className="mb-4 border-t border-white/10 pt-4">
            <h4 className="mb-2 font-medium text-white">{String(section.section)}</h4>
            <p className="mb-3 text-sm text-white/60">{String(section.summary)}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase text-emerald-400/80">Added</p>
                {((section.added as Array<{ text: string; citation?: string }>) || []).map((item, i) => (
                  <p key={i} className="mb-1 text-xs text-white/70">+ {item.text}</p>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs uppercase text-amber-400/80">Removed</p>
                {((section.removed as Array<{ text: string }>) || []).map((item, i) => (
                  <p key={i} className="mb-1 text-xs text-white/70">− {item.text}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
