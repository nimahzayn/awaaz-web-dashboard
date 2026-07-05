import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { MetricCard } from "@/components/cards/MetricCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { LikertPlaceholder } from "@/components/charts/LikertPlaceholder";
import { BarChart } from "@/components/charts/BarChart";
import {
  WORKSHOP_EXPERIENCE_METRICS,
  SENTIMENT_DATA,
  OPEN_ENDED_RESPONSES,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Workshop Experience",
};

const satisfactionBreakdown = [
  { name: "Content Quality", value: 4.3 },
  { name: "Activity Design", value: 4.5 },
  { name: "Facilitation", value: 4.5 },
  { name: "Pace & Timing", value: 3.8 },
  { name: "Materials", value: 4.0 },
  { name: "Safe Space", value: 4.6 },
];

const recommendData = [
  { name: "Yes", value: 34 },
  { name: "Maybe", value: 6 },
  { name: "No", value: 2 },
];

export default function WorkshopExperiencePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Workshop Experience"
        description="Understand overall participant satisfaction, willingness to recommend, and emotional responses to the Justice Innovation workshop experience."
        badge="Experience & Sentiment"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <section aria-labelledby="experience-metrics">
        <SectionHeader
          title="Experience Metrics"
          description="Key satisfaction indicators"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSHOP_EXPERIENCE_METRICS.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Satisfaction Breakdown"
          description="Ratings across experience dimensions"
          index={0}
        >
          <BarChart
            data={satisfactionBreakdown}
            color={BRAND_COLORS.primary}
            height={300}
          />
        </ChartCard>

        <ChartCard
          title="Would Recommend"
          description="Participant willingness to recommend the workshop"
          index={1}
        >
          <DonutChart data={recommendData} height={280} />
        </ChartCard>
      </div>

      <ChartCard
        title="Participant Sentiment"
        description="Emotional responses captured in post-workshop surveys"
        index={2}
      >
        <LikertPlaceholder data={SENTIMENT_DATA} />
      </ChartCard>

      <section aria-labelledby="sentiment-quotes">
        <SectionHeader
          title="Participant Voices"
          description="Selected reflections on the workshop experience"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {OPEN_ENDED_RESPONSES.slice(0, 4).map((response, index) => (
            <InsightCard
              key={index}
              insight={{
                id: `exp-${index}`,
                title: `Participant ${index + 1}`,
                description: response,
                type: index % 2 === 0 ? "positive" : "neutral",
              }}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
