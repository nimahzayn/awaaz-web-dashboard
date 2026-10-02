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

function hasCap(analytics: AnalyticsSnapshot, cap: NonNullable<AnalyticsSnapshot["capabilities"]>[number]) {
  if (analytics.capabilities?.length) return analytics.capabilities.includes(cap);
  const dims = analytics.dimensions;
  switch (cap) {
    case "abc_learning_journey":
      return dims.some((d) => d.a > 0 && d.b > 0 && d.c > 0);
    case "perception_shift":
    case "misconception_analysis":
      return dims.some((d) => d.a > 0 && d.b > 0);
    case "learning_gain":
      return dims.some((d) => d.b > 0 && d.c > 0);
    case "before_after":
    case "direct_change":
      return dims.some((d) => d.a > 0 && d.c > 0);
    default:
      return true;
  }
}

export function InsightsContent({ workshop, analytics }: InsightsContentProps) {
  const showAbcJourney = hasCap(analytics, "abc_learning_journey") && analytics.dimensions.length > 0;
  const showPerception =
    (hasCap(analytics, "perception_shift") || hasCap(analytics, "misconception_analysis")) &&
    analytics.analysisMode !== "pre_post";
  const showGain = hasCap(analytics, "learning_gain") || hasCap(analytics, "direct_change");
  const showBeforeAfter =
    hasCap(analytics, "before_after") && analytics.analysisMode === "pre_post" && analytics.dimensions.length > 0;

  return (
    <div className="space-y-16 pb-20">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Deep analysis of learning patterns, perception shifts, and workshop impact.
        </p>
        {analytics.analysisMode && (
          <p className="text-xs text-muted-foreground">
            Analysis mode: <span className="font-medium capitalize">{analytics.analysisMode.replace(/_/g, " ")}</span>
          </p>
        )}
      </div>

      {showAbcJourney && <LearningJourneySection analytics={analytics} />}
      {showBeforeAfter && !showAbcJourney && (
        <PerceptionShiftSection
          topics={analytics.dimensions}
          title="Direct Before / After Change"
          subtitle="Change between pre-workshop and post-workshop responses on matched questions."
          variant="pre_post"
        />
      )}
      {showPerception && analytics.dimensions.length > 0 && (
        <PerceptionShiftSection topics={analytics.dimensions} />
      )}
      {(showGain || analytics.skills.length > 0) && <KnowledgeGrowthSection analytics={analytics} showGain={showGain} />}
      {analytics.activities.length > 0 && <ActivityImpactSection activities={analytics.activities} />}
      {(analytics.collaboration || analytics.facilitator || analytics.overallSatisfaction !== null) && (
        <SentimentSection analytics={analytics} />
      )}
      <RecommendationsSection analytics={analytics} />
    </div>
  );
}
