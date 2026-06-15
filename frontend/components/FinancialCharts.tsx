'use client';

interface Metric {
  metric_name: string;
  current_value: string;
  prior_year_value: string;
  yoy_change: string;
  industry_average?: string;
  percentile_rank?: number;
  assessment?: string;
}

interface FinancialChartsProps {
  metrics: Metric[];
}

const parseNum = (v: string) => parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;

export default function FinancialCharts({ metrics }: FinancialChartsProps) {
  const marginMetrics = metrics.filter((m) =>
    ['gross_margin', 'operating_margin', 'net_margin'].includes(m.metric_name)
  );

  const maxBar = Math.max(
    ...marginMetrics.flatMap((m) => [parseNum(m.current_value), parseNum(m.industry_average || '0')]),
    1
  );

  return (
    <div className="space-y-6">
      <div className="glass-card overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left muted">
              <th className="p-3">Metric</th>
              <th className="p-3">Current</th>
              <th className="p-3">Prior Year</th>
              <th className="p-3">YoY</th>
              <th className="p-3">Industry Avg</th>
              <th className="p-3">Assessment</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.metric_name} className="border-b border-white/5">
                <td className="p-3 font-medium text-white">{m.metric_name.replace(/_/g, ' ')}</td>
                <td className="p-3">{m.current_value}</td>
                <td className="p-3 muted">{m.prior_year_value}</td>
                <td className="p-3">{m.yoy_change}</td>
                <td className="p-3 muted">{m.industry_average || '-'}</td>
                <td className={`p-3 severity-${m.assessment || 'adequate'}`}>{m.assessment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {marginMetrics.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Margin Comparison vs Industry</h3>
          <div className="space-y-4">
            {marginMetrics.map((m) => {
              const companyVal = parseNum(m.current_value);
              const industryVal = parseNum(m.industry_average || '0');
              return (
                <div key={m.metric_name}>
                  <p className="mb-2 text-sm muted">{m.metric_name.replace(/_/g, ' ')}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-xs text-cyan-400">Company</span>
                      <div className="flex-1 h-5 rounded bg-white/5">
                        <div
                          className="h-full rounded bg-gradient-to-r from-sky-500 to-amber-500 transition-all"
                          style={{ width: `${(companyVal / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-xs text-white">{m.current_value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-xs muted">Industry</span>
                      <div className="flex-1 h-5 rounded bg-white/5">
                        <div
                          className="h-full rounded bg-neutral/60 transition-all"
                          style={{ width: `${(industryVal / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-xs text-neutral">{m.industry_average || '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Debt & Cash Position</h3>
        <div className="grid grid-cols-2 gap-4">
          {['total_debt', 'cash', 'free_cash_flow'].map((name) => {
            const m = metrics.find((x) => x.metric_name === name);
            if (!m) return null;
            return (
              <div key={name} className="rounded-lg bg-white/5 p-4">
                <p className="text-xs muted">{name.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold text-white">{m.current_value}</p>
                <p className="text-xs muted">Prior: {m.prior_year_value} ({m.yoy_change})</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
