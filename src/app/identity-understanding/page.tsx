import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ProgressCard } from "@/components/cards/ProgressCard";
import { GroupedBarChart, ABC_GROUP_CONFIG } from "@/components/charts/GroupedBarChart";
import {
  IDENTITY_DIMENSIONS,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Identity Understanding",
};

export default function IdentityUnderstandingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Identity Understanding"
        description="Examine how participants' understanding of caste, gender, and religion evolved through the workshop's reflective and experiential activities."
        badge="Identity Dimensions"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-6 lg:grid-cols-3">
        {IDENTITY_DIMENSIONS.map((dimension, index) => {
          const chartData = [
            {
              name: dimension.dimension,
              A: dimension.before,
              B: dimension.reflection,
              C: dimension.after,
            },
          ];

          const colors = [
            BRAND_COLORS.primary,
            BRAND_COLORS.purple,
            BRAND_COLORS.blue,
          ];

          return (
            <div key={dimension.id} className="space-y-4">
              <ChartCard
                title={dimension.dimension}
                description={dimension.description}
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
                  value={dimension.before}
                  color={BRAND_COLORS.blue}
                  index={0}
                />
                <ProgressCard
                  label="Reflection"
                  value={dimension.reflection}
                  color={BRAND_COLORS.coral}
                  index={1}
                />
                <ProgressCard
                  label="After"
                  value={dimension.after}
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
