"use client";

import { LearningJourneyChart } from "@/components/charts/LearningJourneyChart";
import type { TopicMetric } from "@/types";

interface LearningJourneySectionProps {
  identityTopics: TopicMetric[];
  creativePedagogy: TopicMetric;
  problemSolving: TopicMetric;
  hasData: boolean;
}

export function LearningJourneySection({
  identityTopics,
  creativePedagogy,
  problemSolving,
  hasData,
}: LearningJourneySectionProps) {
  const allTopics = [...identityTopics, creativePedagogy, problemSolving];
  const avgA = allTopics.reduce((s, t) => s + t.a, 0) / allTopics.length;
  const avgB = allTopics.reduce((s, t) => s + t.b, 0) / allTopics.length;
  const avgC = allTopics.reduce((s, t) => s + t.c, 0) / allTopics.length;

  const chartData = hasData
    ? [
        { stage: "Original Before (A)", value: Number(avgA.toFixed(1)) },
        { stage: "Retrospective Before (B)", value: Number(avgB.toFixed(1)) },
        { stage: "After Workshop (C)", value: Number(avgC.toFixed(1)) },
      ]
    : [
        { stage: "Original Before (A)", value: 0 },
        { stage: "Retrospective Before (B)", value: 0 },
        { stage: "After Workshop (C)", value: 0 },
      ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Learning Journey
        </h3>
        <p className="text-xs text-muted-foreground">
          Participant understanding across the A → B → C progression
        </p>
      </div>
      <LearningJourneyChart data={chartData} />
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>A = Before, B = Retrospective, C = After</span>
        </div>
      </div>
    </div>
  );
}
