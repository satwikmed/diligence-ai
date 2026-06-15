'use client';

interface ComparisonRow {
  metric: string;
  company_1: { name: string; value: string; assessment: string };
  company_2: { name: string; value: string; assessment: string };
  stronger: string;
}

interface CompanyCompareProps {
  data: {
    company_1: { id: string; name: string; data_quality_score: number };
    company_2: { id: string; name: string; data_quality_score: number };
    financial_comparison: ComparisonRow[];
    risk_count: { company_1: number; company_2: number };
    insights_count: { company_1: number; company_2: number };
    red_flags_count: { company_1: number; company_2: number };
  };
}

export default function CompanyCompare({ data }: CompanyCompareProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-4 text-center">
          <h3 className="text-lg font-bold text-white">{data.company_1.name}</h3>
          <p className="text-sm muted">Quality: {data.company_1.data_quality_score?.toFixed(0)}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <h3 className="text-lg font-bold text-white">{data.company_2.name}</h3>
          <p className="text-sm muted">Quality: {data.company_2.data_quality_score?.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="glass-card p-4">
          <p className="muted text-sm">Risks</p>
          <p className="text-white">{data.risk_count.company_1} vs {data.risk_count.company_2}</p>
        </div>
        <div className="glass-card p-4">
          <p className="muted text-sm">Insights</p>
          <p className="text-white">{data.insights_count.company_1} vs {data.insights_count.company_2}</p>
        </div>
        <div className="glass-card p-4">
          <p className="muted text-sm">Red Flags</p>
          <p className="text-white">{data.red_flags_count.company_1} vs {data.red_flags_count.company_2}</p>
        </div>
      </div>

      <div className="glass-card overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left muted">
              <th className="p-3">Metric</th>
              <th className="p-3">{data.company_1.name}</th>
              <th className="p-3">{data.company_2.name}</th>
              <th className="p-3">Stronger</th>
            </tr>
          </thead>
          <tbody>
            {data.financial_comparison.map((row) => (
              <tr key={row.metric} className="border-b border-white/5">
                <td className="p-3 text-white">{row.metric.replace(/_/g, ' ')}</td>
                <td className={`p-3 ${row.stronger === 'company_1' ? 'text-success font-medium' : ''}`}>
                  {row.company_1.value || '-'}
                </td>
                <td className={`p-3 ${row.stronger === 'company_2' ? 'text-success font-medium' : ''}`}>
                  {row.company_2.value || '-'}
                </td>
                <td className="p-3 muted">{row.stronger === 'tie' ? 'Tie' : row.stronger === 'company_1' ? data.company_1.name : data.company_2.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
