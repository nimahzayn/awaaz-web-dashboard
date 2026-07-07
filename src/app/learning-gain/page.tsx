import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ComparisonCard } from "@/components/cards/ComparisonCard";
import { BarChart } from "@/components/charts/BarChart";
import { HeatmapPlaceholder } from "@/components/charts/HeatmapPlaceholder";
import { LineChart } from "@/components/charts/LineChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Knowledge Growth",
};

export default async function LearningGainPage() {
  const analytics = await computeAnalytics();
  const gainTrend = analytics.identityTopics.map((topic) => ({
    name: topic.topic,
    gain: topic.gain,
    value: topic.gain,
  }));
  const heatmapColumns = ["a", "b", "c"];
  const columnLabels = {
    a: "A",
    b: "B",
    c: "C",
  };
  const heatmapData = analytics.identityTopics.map((topic) => ({
    topic: topic.topic,
    a: topic.a,
    b: topic.b,
    c: topic.c,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Growth"
        description="Measure knowledge growth across workshop topics. Compare before and after understanding to identify areas of greatest learning impact."
        badge="Growth Analysis"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ComparisonCard
          label={analytics.identityTopics[0].topic}
          beforeValue={analytics.identityTopics[0].b}
          afterValue={analytics.identityTopics[0].c}
          description="Largest learning gain observed"
          index={0}
        />
        <ComparisonCard
          label={analytics.identityTopics[1].topic}
          beforeValue={analytics.identityTopics[1].b}
          afterValue={analytics.identityTopics[1].c}
          description="Strong conceptual growth"
          index={1}
        />
        <ComparisonCard
          label={analytics.identityTopics[2].topic}
          beforeValue={analytics.identityTopics[2].b}
          afterValue={analytics.identityTopics[2].c}
          description="Notable shift in perspective"
          index={2}
        />
        <ComparisonCard
          label="Community Action"
          beforeValue={2.8}
          afterValue={4.0}
          description="Applied understanding improved"
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Learning Gain by Topic"
          description="Difference between pre and post workshop understanding"
          index={0}
        >
          <BarChart
            data={analytics.identityTopics.map((topic) => ({
              name: topic.topic,
              value: topic.gain,
            }))}
            dataKey="value"
            color={BRAND_COLORS.purple}
            height={300}
          />
        </ChartCard>

        <ChartCard
          title="Cumulative Gain Trend"
          description="Learning gain progression over workshop duration"
          index={1}
        >
          <LineChart
            data={gainTrend}
            lines={[
              { key: "gain", label: "Avg. Gain", color: BRAND_COLORS.green },
            ]}
            height={300}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Understanding Heatmap"
        description="Topic understanding levels across workshop timeline"
        index={2}
      >
        <HeatmapPlaceholder
          data={heatmapData}
          columns={heatmapColumns}
          columnLabels={columnLabels}
        />
      </ChartCard>
    </div>
  );
}
