"use client";

import { RadarChart } from "@/components/charts/RadarChart";
import type { TopicMetric } from "@/types";

interface KnowledgeGrowthSectionProps {
  identityTopics: TopicMetric[];
  skills: Array<{ name: string; value: number }>;
  hasData: boolean;
}

export function KnowledgeGrowthSection({
  identityTopics,
  skills,
  hasData,
}: KnowledgeGrowthSectionProps) {
  const radarData = hasData
    ? identityTopics.map((t) => ({
        subject: t.topic,
        score: Math.round(t.c * 20),
      }))
    : [
        { subject: "Caste", score: 0 },
        { subject: "Gender", score: 0 },
        { subject: "Religion", score: 0 },
      ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Knowledge Growth
        </h3>
        <p className="text-xs text-muted-foreground">
          Post-workshop competency levels across identity topics
        </p>
      </div>
      <RadarChart data={radarData} color="#E8126E" height={280} />
    </div>
  );
}
