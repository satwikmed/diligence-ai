'use client';

interface ExecutiveSummaryProps {
  summary: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export default function ExecutiveSummary({ summary, score, metadata }: ExecutiveSummaryProps) {
  const scoreColor = score >= 80 ? 'badge-success' : score >= 60 ? 'badge-warning' : 'badge-danger';

  return (
    <div className="glass-card relative p-8">
      <div className="absolute right-6 top-6">
        <span className={`badge ${scoreColor}`}>Data Quality: {score.toFixed(0)}</span>
      </div>
      <h2 className="mb-4 text-2xl font-bold text-white">Executive Summary</h2>
      <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-white/70">
        {summary}
      </div>
      {metadata && (
        <div className="mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-sm muted">
          {metadata.processing_time_seconds != null && (
            <span>Processing: {Number(metadata.processing_time_seconds).toFixed(1)}s</span>
          )}
          {metadata.total_chunks != null && (
            <span>Chunks: {String(metadata.total_chunks)}</span>
          )}
          {metadata.total_pages != null && (
            <span>Pages: {String(metadata.total_pages)}</span>
          )}
        </div>
      )}
    </div>
  );
}
