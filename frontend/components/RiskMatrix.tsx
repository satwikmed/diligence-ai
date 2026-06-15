'use client';

import { useState } from 'react';

interface Risk {
  risk_name: string;
  description: string;
  severity: string;
  likelihood: string;
  category: string;
  news_relevant?: boolean;
  source_section?: string;
}

interface RiskMatrixProps {
  risks: Risk[];
}

const severityBadge: Record<string, string> = {
  critical: 'badge-danger',
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-success',
};

export default function RiskMatrix({ risks }: RiskMatrixProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const sorted = [...risks].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sorted.map((risk, i) => (
        <div
          key={i}
          className="glass-card cursor-pointer p-4 transition-all hover:border-cyan-400/40"
          onClick={() => setExpanded(expanded === i ? null : i)}
        >
          <div className="mb-2 flex flex-wrap gap-2">
            <span className={`badge ${severityBadge[risk.severity] || 'badge-neutral'}`}>
              {risk.severity}
            </span>
            <span className="badge badge-neutral">{risk.likelihood}</span>
            <span className="badge badge-primary">{risk.category}</span>
            {risk.news_relevant && (
              <span className="badge badge-danger animate-pulse">In The News</span>
            )}
          </div>
          <h4 className="font-semibold text-white">{risk.risk_name}</h4>
          {expanded === i && (
            <p className="mt-2 text-sm muted">{risk.description}</p>
          )}
          {risk.source_section && (
            <p className="mt-2 text-xs muted">Source: {risk.source_section}</p>
          )}
        </div>
      ))}
    </div>
  );
}
