'use client';

interface CompanyOverviewProps {
  overview: {
    name?: string;
    industry?: string;
    headquarters?: string;
    employees?: string;
    founded?: string;
    stock_ticker?: string;
    description?: string;
  };
}

export default function CompanyOverviewCard({ overview }: CompanyOverviewProps) {
  const fields = [
    { label: 'Industry', value: overview.industry },
    { label: 'Headquarters', value: overview.headquarters },
    { label: 'Employees', value: overview.employees },
    { label: 'Founded', value: overview.founded },
    { label: 'Ticker', value: overview.stock_ticker },
  ];

  return (
    <div className="glass-card p-6">
      <h2 className="mb-2 text-xl font-bold text-white">{overview.name || 'Company Overview'}</h2>
      {overview.description && (
        <p className="mb-4 text-sm muted">{overview.description}</p>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {fields.map((f) => f.value && (
          <div key={f.label}>
            <p className="text-xs muted">{f.label}</p>
            <p className="font-medium text-white">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
