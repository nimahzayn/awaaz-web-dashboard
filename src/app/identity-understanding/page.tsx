import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ProgressCard } from "@/components/cards/ProgressCard";
import {
  GroupedBarChart,
  ABC_GROUP_CONFIG,
} from "@/components/charts/GroupedBarChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Identity Understanding",
};

export default async function IdentityUnderstandingPage() {
  const analytics = await computeAnalytics();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Identity Understanding"
        description="Examine how participants' understanding of caste, gender, and religion evolved through the workshop's reflective and experiential activities."
        badge="Identity Dimensions"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-6 lg:grid-cols-3">
        {analytics.identityTopics.map((dimension, index) => {
          const chartData = [
            {
              name: dimension.topic,
              A: dimension.a,
              B: dimension.b,
              C: dimension.c,
            },
          ];

          const colors = [
            BRAND_COLORS.primary,
            BRAND_COLORS.purple,
            BRAND_COLORS.blue,
          ];

          return (
            <div key={dimension.topic} className="space-y-4">
              <ChartCard
                title={dimension.topic}
                description={`${dimension.topic} understanding across A, B, and C stages`}
                index={index}
              >
                <GroupedBarChart
                  data={chartData}
                  groups={ABC_GROUP_CONFIG}
                  height={220}
                />
              </ChartCard>

              <div className="space-y-2">
                <ProgressCard
                  label="Before"
                  value={dimension.a}
                  color={BRAND_COLORS.blue}
                  index={0}
                />
                <ProgressCard
                  label="Reflection"
                  value={dimension.b}
                  color={BRAND_COLORS.coral}
                  index={1}
                />
                <ProgressCard
                  label="After"
                  value={dimension.c}
                  color={colors[index]}
                  index={2}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
