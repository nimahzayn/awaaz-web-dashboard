import { Users, FileCheck, Star, TrendingUp } from "lucide-react";

interface SupportingMetricsProps {
  participants: number;
  completedSurveys: number;
  satisfaction: number;
  learningGain: number;
  hasData: boolean;
}

const metrics = [
  { key: "participants", label: "Participants", icon: Users, color: "#339CFF" },
  { key: "surveys", label: "Survey Completion", icon: FileCheck, color: "#44E6AD" },
  { key: "satisfaction", label: "Satisfaction", icon: Star, color: "#E8126E" },
  { key: "learningGain", label: "Learning Gain", icon: TrendingUp, color: "#B07AE6" },
];

export function SupportingMetrics({
  participants,
  completedSurveys,
  satisfaction,
  learningGain,
  hasData,
}: SupportingMetricsProps) {
  const values: Record<string, string> = {
    participants: hasData ? String(participants) : "—",
    surveys: hasData ? `${completedSurveys} / ${participants}` : "—",
    satisfaction: hasData ? `${satisfaction} / 5` : "—",
    learningGain: hasData ? `+${learningGain}` : "—",
  };

  const descriptions: Record<string, string> = {
    participants: "Across the full workshop cohort",
    surveys: "Pre and post workshop responses",
    satisfaction: "Average participant experience",
    learningGain: "Average growth across topics",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.key}
            className="group rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-md shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${metric.color}10` }}
              >
                <Icon className="h-4 w-4" style={{ color: metric.color }} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-foreground">
                {values[metric.key]}
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                {descriptions[metric.key]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
