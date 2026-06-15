'use client';

interface RedFlag {
  flag: string;
  description: string;
  severity: string;
  source_page?: number;
}

interface RedFlagsProps {
  flags: RedFlag[];
}

export default function RedFlags({ flags }: RedFlagsProps) {
  if (!flags.length) return null;

  return (
    <div className="glass-card border-2 border-red-500/30 p-6">
      <h2 className="mb-4 text-xl font-bold text-red-400">Red Flags</h2>
      <div className="space-y-4">
        {flags.map((flag, i) => (
          <div key={i} className="border-l-4 border-danger pl-4">
            <h4 className="font-semibold text-white">{flag.flag}</h4>
            <p className="mt-1 text-sm muted">{flag.description}</p>
            {flag.source_page && (
              <p className="mt-1 text-xs muted">Page {flag.source_page}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
