'use client';

interface Recommendation {
  title: string;
  description: string;
  priority: string;
  rationale: string;
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

const priorityBadge: Record<string, string> = {
  critical: 'badge-danger',
  high: 'badge-warning',
  medium: 'badge-primary',
  low: 'badge-neutral',
};

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const sorted = [...recommendations].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority as keyof typeof order] ?? 4) - (order[b.priority as keyof typeof order] ?? 4);
  });

  return (
    <div className="space-y-4">
      {sorted.map((rec, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-semibold text-white">{rec.title}</h4>
            <span className={`badge shrink-0 ${priorityBadge[rec.priority] || 'badge-neutral'}`}>
              {rec.priority}
            </span>
          </div>
          <p className="mt-2 text-sm muted">{rec.description}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-cyan-400/80">Rationale</summary>
            <p className="mt-1 text-sm muted">{rec.rationale}</p>
          </details>
        </div>
      ))}
    </div>
  );
}
