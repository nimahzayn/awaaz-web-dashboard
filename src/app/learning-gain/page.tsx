import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ComparisonCard } from "@/components/cards/ComparisonCard";
import { BarChart } from "@/components/charts/BarChart";
import { HeatmapPlaceholder } from "@/components/charts/HeatmapPlaceholder";
import { LineChart } from "@/components/charts/LineChart";
import {
  LEARNING_GAIN_TOPICS,
  HEATMAP_DATA,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Learning Gain",
};

const gainTrend = [
  { name: "Week 1", gain: 0.4 },
  { name: "Week 2", gain: 0.8 },
  { name: "Week 3", gain: 1.2 },
  { name: "Week 4", gain: 1.5 },
];

export default function LearningGainPage() {
  const heatmapColumns = ["week1", "week2", "week3", "week4"];
  const columnLabels = {
    week1: "Pre",
    week2: "Day 1",
    week3: "Day 2",
    week4: "Post",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning Gain"
        description="Measure knowledge growth across workshop topics. Compare before and after understanding to identify areas of greatest learning impact."
        badge="Growth Analysis"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ComparisonCard
          label="Structural Injustice"
          beforeValue={2.2}
          afterValue={4.0}
          description="Largest learning gain observed"
          index={0}
        />
        <ComparisonCard
          label="Intersectionality"
          beforeValue={2.5}
          afterValue={4.0}
          description="Strong conceptual growth"
          index={1}
        />
        <ComparisonCard
          label="Privilege Awareness"
          beforeValue={2.6}
          afterValue={4.0}
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
            data={LEARNING_GAIN_TOPICS}
            dataKey="gain"
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
            lines={[{ key: "gain", label: "Avg. Gain", color: BRAND_COLORS.green }]}
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
          data={HEATMAP_DATA}
          columns={heatmapColumns}
          columnLabels={columnLabels}
        />
      </ChartCard>
    </div>
  );
}
