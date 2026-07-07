import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ABCInfoCard } from "@/components/shared/ABCInfoCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { MetricCard } from "@/components/cards/MetricCard";
import {
  GroupedBarChart,
  ABC_GROUP_CONFIG,
} from "@/components/charts/GroupedBarChart";
import { SlopeChart } from "@/components/charts/SlopeChart";
import { LineChart } from "@/components/charts/LineChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Learning Journey",
};

export default async function LearningImpactPage() {
  const analytics = await computeAnalytics();
  const abcMetrics = [
    {
      id: "A",
      label: "A — Original Before",
      value: analytics.identityTopics[0].a,
      description: "Original pre-workshop understanding",
      color: BRAND_COLORS.blue,
    },
    {
      id: "B",
      label: "B — Retrospective Before",
      value: analytics.identityTopics[0].b,
      description: "Retrospective estimate of pre-workshop understanding",
      color: BRAND_COLORS.coral,
    },
    {
      id: "C",
      label: "C — After Workshop",
      value: analytics.identityTopics[0].c,
      description: "Post-workshop understanding",
      color: BRAND_COLORS.green,
    },
  ];

  const progressionData = [
    { name: "A", value: analytics.identityTopics[0].a },
    { name: "B", value: analytics.identityTopics[0].b },
    { name: "C", value: analytics.identityTopics[0].c },
  ];

  const topicComparison = analytics.identityTopics.map((topic) => ({
    name: topic.topic,
    A: topic.a,
    B: topic.b,
    C: topic.c,
    value: topic.c,
  }));

  const trajectoryData = analytics.identityTopics.map((topic) => ({
    participant: topic.topic,
    before: topic.a,
    after: topic.c,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning Journey"
        description="Track how participant understanding evolves through the A → B → C framework — from original pre-workshop beliefs to post-workshop comprehension."
        badge="A → B → C Framework"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <ABCInfoCard
        stages={[
          {
            stage: "A",
            label: "Original Before",
            description: "Participant's original pre-workshop rating.",
            value: analytics.identityTopics[0].a,
          },
          {
            stage: "B",
            label: "Retrospective Before",
            description:
              "Participant's retrospective rating of what they now believe their pre-workshop understanding was.",
            value: analytics.identityTopics[0].b,
          },
          {
            stage: "C",
            label: "After Workshop",
            description: "Participant's post-workshop rating.",
            value: analytics.identityTopics[0].c,
          },
        ]}
      />

      <section aria-labelledby="abc-scores">
        <SectionHeader
          title="Overall ABC Scores"
          description="Aggregate understanding levels across all participants"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {abcMetrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Understanding by Topic"
          description="Grouped comparison of A, B, and C scores across learning domains"
          index={0}
          className="lg:col-span-2"
        >
          <GroupedBarChart
            data={topicComparison}
            groups={ABC_GROUP_CONFIG}
            height={340}
          />
        </ChartCard>

        <ChartCard
          title="ABC Progression"
          description="Overall shift from original understanding to post-workshop"
          index={1}
        >
          <LineChart
            data={progressionData}
            lines={[
              {
                key: "score",
                label: "Understanding Score",
                color: BRAND_COLORS.primary,
              },
            ]}
            xAxisKey="name"
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Individual Learning Trajectories"
          description="Before-to-after understanding shifts per participant"
          index={2}
        >
          <SlopeChart data={trajectoryData} height={280} />
        </ChartCard>
      </div>
    </div>
  );
}
