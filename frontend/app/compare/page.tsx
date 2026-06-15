'use client';

import { useEffect, useState } from 'react';
import CompanyCompare from '@/components/CompanyCompare';
import PageShell from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { getDemoCompare, getDemoHistory } from '@/lib/demo-data';

export default function ComparePage() {
  const [items, setItems] = useState<Array<{ document_id: string; company_name: string }>>([]);
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  const [comparison, setComparison] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const completed = (getDemoHistory().items || []).filter(
      (i) => i.processing_status === 'complete'
    );
    setItems(completed);
    if (completed.length >= 2) {
      setDoc1(completed[0].document_id);
      setDoc2(completed[1].document_id);
    }
  }, []);

  const runCompare = () => {
    if (!doc1 || !doc2) return;
    setLoading(true);
    try {
      const data = getDemoCompare(doc1, doc2);
      if (data) setComparison(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doc1 && doc2 && doc1 !== doc2) runCompare();
  }, [doc1, doc2]);

  return (
    <PageShell
      eyebrow="Compare"
      line1="Side-by-Side"
      line2="Company"
      line3="Analysis"
      title="Compare Companies"
      subtitle="Side-by-side due diligence comparison across financial metrics, risks, and insights."
    >
      <div className="glass-card mb-8 flex flex-wrap gap-4 p-6">
        <select
          value={doc1}
          onChange={(e) => setDoc1(e.target.value)}
          className="input-glass min-w-[200px]"
        >
          <option value="">Select Company 1</option>
          {items.map((i) => <option key={i.document_id} value={i.document_id}>{i.company_name}</option>)}
        </select>
        <select
          value={doc2}
          onChange={(e) => setDoc2(e.target.value)}
          className="input-glass min-w-[200px]"
        >
          <option value="">Select Company 2</option>
          {items.map((i) => <option key={i.document_id} value={i.document_id}>{i.company_name}</option>)}
        </select>
        <Button onClick={runCompare} disabled={loading || !doc1 || !doc2}>
          {loading ? 'Comparing...' : 'Compare'}
        </Button>
      </div>
      {comparison && <CompanyCompare data={comparison as Parameters<typeof CompanyCompare>[0]['data']} />}
    </PageShell>
  );
}
