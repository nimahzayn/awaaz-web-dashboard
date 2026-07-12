"use client";

import { PerceptionShiftChart } from "@/components/charts/PerceptionShiftChart";
import type { TopicMetric } from "@/types";

interface PerceptionShiftSectionProps {
  identityTopics: TopicMetric[];
  hasData: boolean;
}

export function PerceptionShiftSection({
  identityTopics,
  hasData,
}: PerceptionShiftSectionProps) {
  const chartData = hasData
    ? identityTopics.map((t) => ({
        topic: t.topic,
        before: t.a,
        retrospective: t.b,
        after: t.c,
      }))
    : [
        { topic: "Caste", before: 0, retrospective: 0, after: 0 },
        { topic: "Gender", before: 0, retrospective: 0, after: 0 },
        { topic: "Religion", before: 0, retrospective: 0, after: 0 },
      ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Perception Shift
        </h3>
        <p className="text-xs text-muted-foreground">
          Comparing original understanding with retrospective and post-workshop views
        </p>
      </div>
      <PerceptionShiftChart data={chartData} />
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#F08367]" />
          <span>Misconception Gap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>Learning Gain</span>
        </div>
      </div>
    </div>
  );
}
