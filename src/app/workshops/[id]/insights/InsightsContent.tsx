"use client";

import type { Workshop, AnalyticsSnapshot } from "@/types";
import { LearningJourneySection } from "./sections/LearningJourneySection";
import { PerceptionShiftSection } from "./sections/PerceptionShiftSection";
import { KnowledgeGrowthSection } from "./sections/KnowledgeGrowthSection";
import { ActivityImpactSection } from "./sections/ActivityImpactSection";
import { SentimentSection } from "./sections/SentimentSection";
import { RecommendationsSection } from "./sections/RecommendationsSection";

interface InsightsContentProps {
  workshop: Workshop;
  analytics: AnalyticsSnapshot;
}

export function InsightsContent({ workshop, analytics }: InsightsContentProps) {
  return (
    <div className="space-y-16 pb-20">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Deep analysis of learning patterns, perception shifts, and workshop impact.
        </p>
      </div>

      <LearningJourneySection analytics={analytics} />
      <PerceptionShiftSection topics={analytics.identityTopics} />
      <KnowledgeGrowthSection analytics={analytics} />
      <ActivityImpactSection activities={analytics.activities} />
      <SentimentSection analytics={analytics} />
      <RecommendationsSection analytics={analytics} />
    </div>
  );
}
