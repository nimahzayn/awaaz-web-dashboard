"use client";

import { ActivityImpactChart } from "@/components/charts/ActivityImpactChart";

interface ActivityImpactSectionProps {
  activities: Array<{
    name: string;
    rating: number;
    category: string;
    description: string;
  }>;
  hasData: boolean;
}

export function ActivityImpactSection({
  activities,
  hasData,
}: ActivityImpactSectionProps) {
  const displayActivities = hasData
    ? activities.slice(0, 8)
    : [
        { name: "Clay Activity", rating: 0, category: "Experiential", description: "" },
        { name: "6W+2H", rating: 0, category: "Analysis", description: "" },
        { name: "River of Life", rating: 0, category: "Reflection", description: "" },
        { name: "AI Activity", rating: 0, category: "Innovation", description: "" },
      ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Activity Impact
        </h3>
        <p className="text-xs text-muted-foreground">
          Participant ratings for each workshop activity
        </p>
      </div>
      <ActivityImpactChart data={displayActivities} />
    </div>
  );
}
