'use client';

interface ProgressTrackerProps {
  events: Array<{ message?: string; timestamp?: string; agent?: string; type?: string }>;
  progress: number;
  estimatedTime?: number;
}

export default function ProgressTracker({ events, progress, estimatedTime }: ProgressTrackerProps) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Processing Pipeline</h3>
        <span className="text-sm text-cyan-300">{progress}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {estimatedTime !== undefined && estimatedTime > 0 && (
        <p className="mb-4 text-sm muted">Estimated time remaining: ~{estimatedTime}s</p>
      )}
      <div className="max-h-64 space-y-2 overflow-y-auto font-mono text-sm">
        {events.map((event, i) => (
          <div key={i} className="flex gap-2 muted">
            <span className="text-primary shrink-0 text-cyan-400">&gt;</span>
            <span>{event.message}</span>
            {event.agent && (
              <span className="badge badge-primary ml-auto shrink-0">{event.agent}</span>
            )}
          </div>
        ))}
        {events.length === 0 && (
          <p className="muted">Waiting for pipeline updates...</p>
        )}
      </div>
    </div>
  );
}
