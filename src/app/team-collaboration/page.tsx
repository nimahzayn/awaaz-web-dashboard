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
  TEAM_COLLABORATION_METRICS,
  LIKERT_DATA,
  TEAM_CHALLENGES,
  TEAM_STRENGTHS,
  WORD_CLOUD_WORDS,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Team Collaboration",
};

const teamDynamics = [
  { name: "Communication", value: 4.2 },
  { name: "Trust", value: 3.9 },
  { name: "Inclusion", value: 4.1 },
  { name: "Conflict Resolution", value: 3.5 },
  { name: "Shared Goals", value: 4.0 },
];

export default function TeamCollaborationPage() {
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
          {TEAM_COLLABORATION_METRICS.map((metric, index) => (
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
          <LikertPlaceholder data={LIKERT_DATA} />
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
        <WordCloudPlaceholder words={WORD_CLOUD_WORDS} />
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
