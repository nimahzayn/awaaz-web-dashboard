"use client";

interface ThemeData {
  label: string;
  value: number;
  color?: string;
}

interface ThemeDistributionProps {
  data: ThemeData[];
}

export function ThemeDistribution({ data }: ThemeDistributionProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((theme) => {
        const intensity = theme.value / max;
        const color = theme.color || "#E8126E";
        return (
          <div
            key={theme.label}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors"
            style={{
              borderColor: `${color}${Math.round(intensity * 60 + 20).toString(16).padStart(2, "0")}`,
              backgroundColor: `${color}${Math.round(intensity * 15).toString(16).padStart(2, "0")}`,
            }}
          >
            <span className="text-xs font-medium text-foreground">{theme.label}</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: `${color}18`,
                color: color,
              }}
            >
              {theme.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
