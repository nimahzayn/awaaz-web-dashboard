import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { WordCloudPlaceholder } from "@/components/charts/WordCloudPlaceholder";
import { LikertPlaceholder } from "@/components/charts/LikertPlaceholder";
import { BarChart } from "@/components/charts/BarChart";
import {
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
  TEAM_CHALLENGES,
  TEAM_STRENGTHS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Team Collaboration",
};

export default async function TeamCollaborationPage() {
  const analytics = await computeAnalytics();
  const teamDynamics = [
    { name: "Ideas Heard", value: analytics.teamCollaboration.ideasHeard },
    { name: "Respect", value: analytics.teamCollaboration.respect },
    {
      name: "Team Preference",
      value: analytics.teamCollaboration.teamPreference,
    },
  ];
  const wordCloudWords = Array.from(
    analytics.teamCollaboration.teamValues
      .concat(analytics.teamCollaboration.visioningExercise)
      .reduce((map, word) => {
        const count = (map.get(word) ?? 0) + 1;
        map.set(word, count);
        return map;
      }, new Map<string, number>()),
  ).map(([text, count]) => ({ text, size: 18 + count * 4 }));
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team Collaboration"
        description="Explore how participants experienced teamwork, diverse perspectives, and collaborative learning during the Justice Innovation workshop."
        badge="Team Dynamics"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <section aria-labelledby="team-metrics">
        <SectionHeader
          title="Collaboration Metrics"
          description="Key indicators of team experience"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              id: "ideas-heard",
              label: "Ideas Heard",
              value: `${analytics.teamCollaboration.ideasHeard.toFixed(1)} / 5`,
              description: "Participants felt their ideas were valued",
              color: BRAND_COLORS.blue,
            },
            {
              id: "respect",
              label: "Respect",
              value: `${analytics.teamCollaboration.respect.toFixed(1)} / 5`,
              description: "Respectful interaction and listening",
              color: BRAND_COLORS.purple,
            },
            {
              id: "team-preference",
              label: "Team Preference",
              value: `${analytics.teamCollaboration.teamPreference.toFixed(1)} / 5`,
              description: "Comfort with collaborative work",
              color: BRAND_COLORS.green,
            },
          ].map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Teamwork Preference"
          description="Likert scale distribution for collaborative work comfort"
          index={0}
        >
          <LikertPlaceholder
            data={[
              { name: "Strongly Disagree", value: 0 },
              { name: "Disagree", value: 0 },
              { name: "Neutral", value: 2 },
              { name: "Agree", value: 4 },
              { name: "Strongly Agree", value: 2 },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Team Dynamics"
          description="Ratings across collaboration dimensions"
          index={1}
        >
          <BarChart
            data={teamDynamics}
            color={BRAND_COLORS.blue}
            height={280}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Collaboration Word Cloud"
        description="Most frequent words in open-ended team responses"
        index={2}
      >
        <WordCloudPlaceholder words={wordCloudWords} />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="team-challenges">
          <SectionHeader title="Team Challenges" />
          <div className="mt-4 space-y-3">
            {TEAM_CHALLENGES.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </div>
        </section>

        <section aria-labelledby="team-strengths">
          <SectionHeader title="Team Strengths" />
          <div className="mt-4 space-y-3">
            {TEAM_STRENGTHS.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
