interface HeroImpactScoreProps {
  score: number;
  satisfaction: number;
  hasData: boolean;
}

export function HeroImpactScore({ score, satisfaction, hasData }: HeroImpactScoreProps) {
  const impactLevel = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";
  const impactColor = score >= 75 ? "#44E6AD" : score >= 50 ? "#FFBA4C" : "#F08367";

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur-md shadow-sm">
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="#E8E8E4"
                strokeWidth="8"
              />
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke={hasData ? impactColor : "#E8E8E4"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 377} 377`}
                transform="rotate(-90 70 70)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                {hasData ? score : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Workshop Impact Score
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              A composite measure of participant growth, satisfaction, and learning outcomes across the workshop.
            </p>
          </div>
          {hasData && (
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${impactColor}15` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: impactColor }} />
              <span className="text-sm font-medium" style={{ color: impactColor }}>
                {impactLevel} Impact
              </span>
            </div>
          )}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">{hasData ? satisfaction : "—"}</span>
              <span className="ml-1">/ 5 satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
