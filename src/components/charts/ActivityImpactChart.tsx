"use client";

interface ActivityData {
  name: string;
  rating: number;
  category: string;
}

interface ActivityImpactChartProps {
  data: ActivityData[];
  height?: number;
}

export function ActivityImpactChart({
  data,
  height = 320,
}: ActivityImpactChartProps) {
  const maxRating = Math.max(...data.map((d) => d.rating), 5);

  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      {data.map((activity) => {
        const percentage = (activity.rating / maxRating) * 100;
        return (
          <div key={activity.name} className="group">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">
                {activity.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {activity.category}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {activity.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: percentage >= 80 ? "#E8126E" : percentage >= 60 ? "#B07AE6" : "#E8E8E4",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
