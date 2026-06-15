'use client';

interface Insight {
  insight: string;
  supporting_evidence: string;
  severity: string;
  category: string;
}

interface InsightsPanelProps {
  insights: Insight[];
}

const severityColors: Record<string, string> = {
  positive: 'border-success/50',
  neutral: 'border-neutral/50',
  concerning: 'border-warning/50',
  critical: 'border-danger/50',
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  const grouped = insights.reduce<Record<string, Insight[]>>((acc, ins) => {
    const cat = ins.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ins);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-lg font-semibold text-cyan-300">{category}</h3>
          <div className="space-y-3">
            {items.map((ins, i) => (
              <div
                key={i}
                className={`glass-card border-l-4 p-4 ${severityColors[ins.severity] || ''}`}
              >
                <p className="font-medium text-white">{ins.insight}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-cyan-400/80">Supporting evidence</summary>
                  <p className="mt-2 text-sm muted">{ins.supporting_evidence}</p>
                </details>
                <span className={`mt-2 inline-block badge badge-${ins.severity === 'positive' ? 'success' : ins.severity === 'concerning' ? 'warning' : 'neutral'}`}>
                  {ins.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
