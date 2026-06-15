'use client';

interface DataQualityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function DataQualityBadge({ score, size = 'md' }: DataQualityBadgeProps) {
  const color = score >= 80 ? 'text-success bg-success/20' : score >= 60 ? 'text-warning bg-warning/20' : 'text-danger bg-danger/20';
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-2' };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${color} ${sizes[size]}`}>
      {score.toFixed(0)}% confidence
    </span>
  );
}
