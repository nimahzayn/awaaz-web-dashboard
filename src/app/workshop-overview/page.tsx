import { computeAnalytics } from "@/services/analytics";
import { getUploadStatus } from "../settings/actions";
import {
  PLACEHOLDER_WORKSHOP,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { WorkshopHeader } from "./WorkshopHeader";
import { AiSummaryCard } from "./AiSummaryCard";
import { HeroImpactScore } from "./HeroImpactScore";
import { SupportingMetrics } from "./SupportingMetrics";
import { LearningJourneySection } from "./LearningJourneySection";
import { PerceptionShiftSection } from "./PerceptionShiftSection";
import { KnowledgeGrowthSection } from "./KnowledgeGrowthSection";
import { ActivityImpactSection } from "./ActivityImpactSection";
import { ThemeSection } from "./ThemeSection";
import { SentimentSection } from "./SentimentSection";
import { CompetencyGrowthSection } from "./CompetencyGrowthSection";
import { AiRecommendations } from "./AiRecommendations";

export const metadata = {
  title: "Workshop Overview",
};

export default async function WorkshopOverviewPage() {
  const analytics = await computeAnalytics();
  const status = await getUploadStatus();
  const hasData = status.preUploaded || status.postUploaded;

  return (
    <div className="space-y-10 pb-16">
      <WorkshopHeader
        name={PLACEHOLDER_WORKSHOP.name}
        cohort={PLACEHOLDER_WORKSHOP.cohort}
        date={PLACEHOLDER_WORKSHOP.date}
        location={PLACEHOLDER_WORKSHOP.location}
        hasData={hasData}
      />

      <AiSummaryCard
        score={analytics.workshopImpactScore}
        participants={analytics.participants}
        satisfaction={analytics.overallSatisfaction}
        learningGain={analytics.learningGainIndex}
        insights={analytics.educatorInsights}
        hasData={hasData}
      />

      <HeroImpactScore
        score={analytics.workshopImpactScore}
        satisfaction={analytics.overallSatisfaction}
        hasData={hasData}
      />

      <SupportingMetrics
        participants={analytics.participants}
        completedSurveys={analytics.completedSurveys}
        satisfaction={analytics.overallSatisfaction}
        learningGain={analytics.learningGainIndex}
        hasData={hasData}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <LearningJourneySection
          identityTopics={analytics.identityTopics}
          creativePedagogy={analytics.creativePedagogy}
          problemSolving={analytics.problemSolving}
          hasData={hasData}
        />

        <PerceptionShiftSection
          identityTopics={analytics.identityTopics}
          hasData={hasData}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <KnowledgeGrowthSection
          identityTopics={analytics.identityTopics}
          skills={analytics.skills}
          hasData={hasData}
        />

        <ActivityImpactSection
          activities={analytics.activities}
          hasData={hasData}
        />
      </div>

      <ThemeSection
        topics={analytics.identityTopics}
        challenges={analytics.teamCollaboration.challenges}
        strengths={analytics.teamCollaboration.strengths}
        hasData={hasData}
      />

      <SentimentSection
        overallSatisfaction={analytics.overallSatisfaction}
        facilitatorRating={analytics.facilitator.averageRating}
        citizenSensitivity={analytics.citizenSensitivity}
        hasData={hasData}
      />

      <CompetencyGrowthSection
        identityGrowth={analytics.identityGrowth}
        problemSolvingGrowth={analytics.problemSolvingGrowth}
        teamCollaboration={analytics.teamCollaboration}
        skills={analytics.skills}
        hasData={hasData}
      />

      <AiRecommendations
        identityTopics={analytics.identityTopics}
        activities={analytics.activities}
        facilitator={analytics.facilitator}
        teamCollaboration={analytics.teamCollaboration}
        hasData={hasData}
      />
    </div>
  );
}
