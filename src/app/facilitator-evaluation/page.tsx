import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { FacilitatorCard } from "@/components/cards/FacilitatorCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { BarChart } from "@/components/charts/BarChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Facilitation Insights",
};

export default async function FacilitatorEvaluationPage() {
  const analytics = await computeAnalytics();
  const facilitatorRatings = [
    { name: "Average", value: analytics.facilitator.averageRating },
    { name: "Safe Environment", value: analytics.facilitator.safeEnvironment },
    {
      name: "Clear Instructions",
      value: analytics.facilitator.clearInstructions,
    },
  ];
  const facilitatorRadar = [
    { subject: "Clarity", score: analytics.facilitator.clearInstructions * 20 },
    {
      subject: "Approachability",
      score: analytics.facilitator.safeEnvironment * 20,
    },
    { subject: "Engagement", score: analytics.facilitator.averageRating * 20 },
    { subject: "Knowledge", score: analytics.facilitator.averageRating * 20 },
    { subject: "Safety", score: analytics.facilitator.safeEnvironment * 20 },
    { subject: "Pacing", score: analytics.facilitator.clearInstructions * 20 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Facilitation Insights"
        description="Review participant feedback on facilitators Gauri, Vaishnavi, and Rohit — including ratings, comments, and suggestions for improvement."
        badge="Facilitator Feedback"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          metric={{
            id: "avg-rating",
            label: "Average Rating",
            value: `${analytics.facilitator.averageRating.toFixed(1)} / 5`,
            description: "Across all facilitators",
            color: BRAND_COLORS.yellow,
          }}
          index={0}
        />
        {[
          {
            id: "safe",
            label: "Safe Environment",
            value: `${analytics.facilitator.safeEnvironment.toFixed(1)} / 5`,
            description: "Learning environment felt safe",
            color: BRAND_COLORS.primary,
          },
          {
            id: "clarity",
            label: "Clear Instructions",
            value: `${analytics.facilitator.clearInstructions.toFixed(1)} / 5`,
            description: "Instructions were easy to follow",
            color: BRAND_COLORS.purple,
          },
          {
            id: "suggestions",
            label: "Suggestions",
            value: analytics.facilitator.suggestions.length,
            description: "Open feedback prompts collected",
            color: BRAND_COLORS.blue,
          },
        ].map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index + 1} />
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
          {[
            {
              id: "facilitator-1",
              name: "Lead Facilitator",
              role: "Overall facilitation",
              rating: analytics.facilitator.averageRating,
              comments: [
                "Created a safe space for difficult conversations",
                "Made complex concepts feel accessible",
              ],
              suggestions: analytics.facilitator.suggestions.slice(0, 2),
            },
            {
              id: "facilitator-2",
              name: "Co-Facilitator",
              role: "Support and pacing",
              rating: analytics.facilitator.safeEnvironment,
              comments: [
                "Balanced reflection with action planning",
                "Encouraged quieter voices to participate",
              ],
              suggestions: [
                "More time for debriefs",
                "Additional examples from lived experience",
              ],
            },
          ].map((facilitator, index) => (
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
