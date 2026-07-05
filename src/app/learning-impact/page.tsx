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
import {
  ABC_STAGES,
  LEARNING_IMPACT_GROUPED,
  SLOPE_CHART_DATA,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Learning Impact",
};

export default function LearningImpactPage() {
  const abcMetrics = ABC_STAGES.map((stage) => ({
    id: stage.stage,
    label: `${stage.stage} — ${stage.label}`,
    value: stage.value,
    description: stage.description,
    color:
      stage.stage === "A"
        ? BRAND_COLORS.blue
        : stage.stage === "B"
          ? BRAND_COLORS.coral
          : BRAND_COLORS.green,
  }));

  const progressionData = ABC_STAGES.map((s) => ({
    name: s.stage,
    score: s.value,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning Impact"
        description="Track how participant understanding evolves through the A → B → C framework — from original pre-workshop beliefs to post-workshop comprehension."
        badge="A → B → C Framework"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <ABCInfoCard stages={ABC_STAGES} />

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
            data={LEARNING_IMPACT_GROUPED}
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
            lines={[{ key: "score", label: "Understanding Score", color: BRAND_COLORS.primary }]}
            xAxisKey="name"
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Individual Learning Trajectories"
          description="Before-to-after understanding shifts per participant"
          index={2}
        >
          <SlopeChart data={SLOPE_CHART_DATA} height={280} />
        </ChartCard>
      </div>
    </div>
  );
}
