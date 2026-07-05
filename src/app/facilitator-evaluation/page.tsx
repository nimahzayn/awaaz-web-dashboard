import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { FacilitatorCard } from "@/components/cards/FacilitatorCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { BarChart } from "@/components/charts/BarChart";
import { RadarChart } from "@/components/charts/RadarChart";
import {
  FACILITATORS,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Facilitator Evaluation",
};

const facilitatorRatings = FACILITATORS.map((f) => ({
  name: f.name,
  value: f.rating,
}));

const facilitatorRadar = [
  { subject: "Clarity", score: 88 },
  { subject: "Approachability", score: 92 },
  { subject: "Engagement", score: 85 },
  { subject: "Knowledge", score: 90 },
  { subject: "Inclusion", score: 87 },
  { subject: "Pacing", score: 78 },
];

export default function FacilitatorEvaluationPage() {
  const avgRating = (
    FACILITATORS.reduce((sum, f) => sum + f.rating, 0) / FACILITATORS.length
  ).toFixed(1);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Facilitator Evaluation"
        description="Review participant feedback on facilitators Gauri, Vaishnavi, and Rohit — including ratings, comments, and suggestions for improvement."
        badge="Facilitator Feedback"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          metric={{
            id: "avg-rating",
            label: "Average Rating",
            value: `${avgRating} / 5`,
            description: "Across all facilitators",
            color: BRAND_COLORS.yellow,
          }}
          index={0}
        />
        {FACILITATORS.map((f, index) => (
          <MetricCard
            key={f.id}
            metric={{
              id: f.id,
              label: f.name,
              value: `${f.rating} / 5`,
              description: f.role,
              color: [BRAND_COLORS.primary, BRAND_COLORS.purple, BRAND_COLORS.blue][index],
            }}
            index={index + 1}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Facilitator Ratings"
          description="Individual ratings comparison"
          index={0}
        >
          <BarChart
            data={facilitatorRatings}
            color={BRAND_COLORS.primary}
            height={260}
          />
        </ChartCard>

        <ChartCard
          title="Facilitation Quality"
          description="Multi-dimensional facilitator evaluation"
          index={1}
        >
          <RadarChart
            data={facilitatorRadar}
            color={BRAND_COLORS.purple}
            height={260}
          />
        </ChartCard>
      </div>

      <section aria-labelledby="facilitator-cards">
        <SectionHeader
          title="Individual Feedback"
          description="Detailed comments and suggestions per facilitator"
        />
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {FACILITATORS.map((facilitator, index) => (
            <FacilitatorCard
              key={facilitator.id}
              facilitator={facilitator}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
