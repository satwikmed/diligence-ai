'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DataQualityBadge from '@/components/DataQualityBadge';
import PageShell from '@/components/ui/page-shell';
import { deleteAnalysis, getHistory } from '@/lib/api';

interface HistoryItem {
  document_id: string;
  company_name: string;
  document_type: string;
  filing_year: number;
  data_quality_score: number;
  upload_timestamp: string;
  processing_status: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory()
      .then((data) => setItems(data.items || []))
      .catch(() => setError('Could not load analysis history.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    try {
      await deleteAnalysis(id);
      setItems((prev) => prev.filter((i) => i.document_id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  const openAnalysis = (item: HistoryItem) => {
    if (item.processing_status === 'complete') {
      router.push(`/analysis/${item.document_id}`);
    }
  };

  return (
    <PageShell
      eyebrow="Archive"
      line1="Analysis"
      line2="History"
      title="Analysis History"
      subtitle="Previously analyzed companies. Click any row to open the full due diligence report."
    >
      {loading ? (
        <div className="glass-card p-10 text-center text-white/60">Loading...</div>
      ) : error ? (
        <div className="glass-card p-10 text-center text-red-300">{error}</div>
      ) : items.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-white/50">No analyses yet.</p>
          <Link href="/upload" className="mt-6 inline-flex h-10 items-center rounded-full bg-gradient-to-r from-sky-500 to-amber-500 px-6 text-sm font-medium text-white">
            Upload a 10-K
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50">
                <th className="p-4">Company</th>
                <th className="p-4">Type</th>
                <th className="p-4">Year</th>
                <th className="p-4">Quality</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.document_id}
                  onClick={() => openAnalysis(item)}
                  className={`border-b border-white/5 transition ${
                    item.processing_status === 'complete'
                      ? 'cursor-pointer hover:bg-white/[0.06]'
                      : 'opacity-60'
                  }`}
                >
                  <td className="p-4">
                    <Link
                      href={`/analysis/${item.document_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-cyan-300 hover:text-cyan-200"
                    >
                      {item.company_name || 'Unknown'}
                    </Link>
                  </td>
                  <td className="p-4 text-white/50">{item.document_type}</td>
                  <td className="p-4 text-white/80">{item.filing_year || '-'}</td>
                  <td className="p-4">
                    {item.data_quality_score ? <DataQualityBadge score={item.data_quality_score} size="sm" /> : '-'}
                  </td>
                  <td className="p-4 text-white/50">
                    {item.upload_timestamp ? new Date(item.upload_timestamp).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${item.processing_status === 'complete' ? 'badge-success' : 'badge-warning'}`}>
                      {item.processing_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={(e) => handleDelete(e, item.document_id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
