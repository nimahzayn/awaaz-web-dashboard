import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { AnalysisCard } from "@/components/cards/AnalysisCard";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import {
  GroupedBarChart,
  ABC_GROUP_CONFIG,
} from "@/components/charts/GroupedBarChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Perception Shift",
};

export default async function MisconceptionAnalysisPage() {
  const analytics = await computeAnalytics();
  const misconceptionShift = analytics.identityTopics.map((topic) => ({
    name: topic.topic,
    before: topic.a,
    after: topic.c,
    value: topic.c,
  }));
  const misconceptionRankings = analytics.identityTopics
    .map((topic) => ({
      name: topic.topic,
      value: Number(topic.misconception.toFixed(1)),
    }))
    .sort((left, right) => right.value - left.value);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Perception Shift"
        description="Identify common misconceptions before the workshop and track how participant understanding shifts through the A → B → C retrospective process."
        badge="Correction Tracking"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-6 lg:grid-cols-3">
        <AnalysisCard
          title="Misconceptions Identified"
          description="Total unique misconceptions flagged"
          index={0}
          className="text-center"
        >
          <p className="text-4xl font-semibold text-coral">
            {analytics.identityTopics.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Across 5 topic areas
          </p>
        </AnalysisCard>
        <AnalysisCard
          title="Correction Rate"
          description="Participants who revised understanding"
          index={1}
          className="text-center"
        >
          <p className="text-4xl font-semibold text-green">
            {analytics.misconceptionCorrectionIndex.toFixed(1)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pending analytics implementation
          </p>
        </AnalysisCard>
        <AnalysisCard
          title="B < A Instances"
          description="Retrospective scores lower than original"
          index={2}
          className="text-center"
        >
          <p className="text-4xl font-semibold text-primary">
            {
              analytics.identityTopics.filter(
                (topic) => topic.misconception > 0,
              ).length
            }
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Indicates revised self-assessment
          </p>
        </AnalysisCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Misconception Frequency"
          description="Most commonly held misconceptions by topic"
          index={0}
        >
          <HorizontalBarChart
            data={misconceptionRankings}
            color={BRAND_COLORS.coral}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Misconception Distribution"
          description="Proportion of misconceptions by category"
          index={1}
        >
          <DonutChart data={misconceptionRankings} height={280} />
        </ChartCard>
      </div>

      <ChartCard
        title="Understanding Shift by Topic"
        description="A-stage vs C-stage scores showing misconception correction"
        index={2}
      >
        <GroupedBarChart
          data={misconceptionShift}
          groups={[
            { key: "before", label: "Before (A)", color: BRAND_COLORS.coral },
            { key: "after", label: "After (C)", color: BRAND_COLORS.green },
          ]}
          height={300}
        />
      </ChartCard>

      <section aria-labelledby="misconception-insights">
        <SectionHeader
          title="Misconception Insights"
          description="Key patterns in participant understanding shifts"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analytics.misconceptionInsights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </div>
      </section>

      <section aria-labelledby="misconception-rankings">
        <SectionHeader
          title="Topic Rankings"
          description="Topics ranked by misconception prevalence"
        />
        <div className="mt-4 space-y-2">
          {misconceptionRankings.map((item, index) => (
            <div
              key={item.name as string}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral/10 text-sm font-bold text-coral">
                {index + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">
                {item.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {item.value} instances
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
