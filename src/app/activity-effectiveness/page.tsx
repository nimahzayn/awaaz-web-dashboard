import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { RadarChart } from "@/components/charts/RadarChart";
import { BarChart } from "@/components/charts/BarChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Activity Impact",
};

export default async function ActivityEffectivenessPage() {
  const analytics = await computeAnalytics();
  const activityBarData = analytics.activities.map((activity) => ({
    name: activity.name,
    value: activity.rating,
  }));
  const radarData = [
    { subject: "Reflection", score: analytics.activities[0].rating * 20 },
    { subject: "Dialogue", score: analytics.activities[1].rating * 20 },
    { subject: "Action", score: analytics.activities[2].rating * 20 },
    { subject: "Engagement", score: analytics.activities[3].rating * 20 },
    { subject: "Clarity", score: analytics.activities[4].rating * 20 },
    { subject: "Relevance", score: analytics.activities[5].rating * 20 },
  ];
  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity Impact"
        description="Evaluate which workshop activities resonated most with participants and identify opportunities for improvement."
        badge="Activity Rankings"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Activity Effectiveness Radar"
          description="Multi-dimensional evaluation of top activities"
          index={0}
        >
          <RadarChart data={radarData} color={BRAND_COLORS.purple} />
        </ChartCard>

        <ChartCard
          title="Activity Ratings"
          description="All activities ranked by participant rating"
          index={1}
        >
          <BarChart
            data={activityBarData}
            color={BRAND_COLORS.yellow}
            height={320}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="top-activities">
          <SectionHeader
            title="Top Activities"
            description="Highest rated workshop activities"
          />
          <div className="mt-4 space-y-3">
            {analytics.activities.slice(0, 3).map((activity, index) => (
              <ActivityCard
                key={activity.name}
                activity={{
                  id: activity.name,
                  name: activity.name,
                  rating: activity.rating,
                  rank: index + 1,
                  category: activity.category,
                  description: activity.description,
                }}
                variant="top"
                index={index}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="bottom-activities">
          <SectionHeader
            title="Areas for Improvement"
            description="Activities with lower participant ratings"
          />
          <div className="mt-4 space-y-3">
            {analytics.activities.slice(3).map((activity, index) => (
              <ActivityCard
                key={activity.name}
                activity={{
                  id: activity.name,
                  name: activity.name,
                  rating: activity.rating,
                  rank: index + 4,
                  category: activity.category,
                  description: activity.description,
                }}
                variant="bottom"
                index={index}
              />
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="activity-ranking">
        <SectionHeader
          title="Full Activity Ranking"
          description="Complete ordered list of all workshop activities"
        />
        <div className="mt-4 space-y-2">
          {analytics.activities.map((activity, index) => (
            <div
              key={activity.name}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  index + 1 <= 3
                    ? "bg-yellow/10 text-yellow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {activity.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.category}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {activity.rating.toFixed(1)} / 5
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
