"use client";

interface SentimentSegment {
  label: string;
  value: number;
  color: string;
}

interface SentimentBarProps {
  data: SentimentSegment[];
  height?: number;
}

export function SentimentBar({ data, height = 40 }: SentimentBarProps) {
  const total = data.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div className="w-full">
      <div
        className="flex w-full overflow-hidden rounded-full"
        style={{ height }}
      >
        {data.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div
              key={segment.label}
              style={{
                width: `${percentage}%`,
                backgroundColor: segment.color,
                transition: "width 0.6s ease",
              }}
              className="relative"
              title={`${segment.label}: ${segment.value} (${Math.round(percentage)}%)`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((segment) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div key={segment.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label}</span>
              <span className="font-medium text-foreground">{Math.round(percentage)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
