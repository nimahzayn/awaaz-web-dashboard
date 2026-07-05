import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { RadarChart } from "@/components/charts/RadarChart";
import { BarChart } from "@/components/charts/BarChart";
import {
  TOP_ACTIVITIES,
  BOTTOM_ACTIVITIES,
  RADAR_DATA,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Activity Effectiveness",
};

const allActivities = [...TOP_ACTIVITIES, ...BOTTOM_ACTIVITIES].sort(
  (a, b) => a.rank - b.rank
);

const activityBarData = allActivities.map((a) => ({
  name: a.name,
  value: a.rating,
}));

export default function ActivityEffectivenessPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity Effectiveness"
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
          <RadarChart data={RADAR_DATA} color={BRAND_COLORS.purple} />
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
            {TOP_ACTIVITIES.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
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
            {BOTTOM_ACTIVITIES.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
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
          {allActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  activity.rank <= 3
                    ? "bg-yellow/10 text-yellow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {activity.rank}
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
                {activity.rating} / 5
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
