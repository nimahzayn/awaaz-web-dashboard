import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { MetricCard } from "@/components/cards/MetricCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { ChartCard } from "@/components/cards/ChartCard";
import {
  PLACEHOLDER_WORKSHOP,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { computeAnalytics } from "@/services/analytics";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Workshop Overview",
};

export default async function WorkshopOverviewPage() {
  const analytics = await computeAnalytics();
  const homeMetrics = [
    {
      id: "participants",
      label: "Participants",
      value: analytics.participants,
      description: "Merged through email ID across both forms",
      trend: "up" as const,
      trendLabel: "Live from survey responses",
      color: "#339CFF",
    },
    {
      id: "surveys",
      label: "Completed Surveys",
      value: `${analytics.completedSurveys} / ${analytics.participants}`,
      description: "Pre and post workshop responses",
      trend: "up" as const,
      trendLabel: "Merged dataset",
      color: "#44E6AD",
    },
    {
      id: "impact-score",
      label: "Workshop Impact Score",
      value: `${analytics.workshopImpactScore} / 100`,
      description: "Composite impact score",
      color: "#E7436D",
    },
    {
      id: "learning-gain",
      label: "Learning Gain Index",
      value: analytics.learningGainIndex,
      description: "Average gain across topics",
      color: "#B07AE6",
    },
    {
      id: "misconception-correction",
      label: "Misconception Correction",
      value: `${analytics.misconceptionCorrectionIndex}`,
      description: "Average discrepancy between A and B",
      color: "#F08367",
    },
    {
      id: "identity-growth",
      label: "Identity Growth",
      value: analytics.identityGrowth,
      description: "Average post-workshop identity growth",
      color: "#FFBA4C",
    },
    {
      id: "problem-solving",
      label: "Problem Solving Growth",
      value: analytics.problemSolvingGrowth,
      description: "Average change in problem solving confidence",
      color: "#B1E043",
    },
    {
      id: "satisfaction",
      label: "Overall Satisfaction",
      value: `${analytics.overallSatisfaction} / 5`,
      description: "Average participant experience rating",
      color: "#44E6AD",
    },
  ];

  const workshopSummaryItems = [
    { label: "Format", value: "Dialogic, reflective, and experiential" },
    {
      label: "Primary outcome",
      value:
        "Greater recognition of structural injustice and shared responsibility",
    },
    {
      label: "Support need",
      value:
        "More time for identity-based reflection and case study discussion",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workshop Overview"
        description="A premium, research-oriented view of the Justice Innovation workshop. Review participant growth, reflection, and impact signals before diving into each learning domain."
        badge={PLACEHOLDER_WORKSHOP.name}
      >
        <Link href="/learning-journey">
          <Button variant="outline" className="gap-2">
            Explore learning journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <section aria-labelledby="overview-kpis">
        <SectionHeader
          title="KPI Snapshot"
          description={`${PLACEHOLDER_WORKSHOP.cohort} · ${PLACEHOLDER_WORKSHOP.date} · ${PLACEHOLDER_WORKSHOP.location}`}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {homeMetrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section aria-labelledby="recent-insights">
          <SectionHeader
            title="Recent Insights"
            description="Highlights emerging from participant responses and facilitation feedback"
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {analytics.educatorInsights.map((insight, index) => (
              <InsightCard
                key={`${insight}-${index}`}
                insight={{
                  id: `home-insight-${index}`,
                  title:
                    index === 0
                      ? "Perception shift"
                      : index === 1
                        ? "Highest impact activity"
                        : index === 2
                          ? "Team challenge"
                          : "Facilitation signal",
                  description: insight,
                  type:
                    index === 1
                      ? "positive"
                      : index === 3
                        ? "neutral"
                        : "attention",
                  tag:
                    index === 0
                      ? "Research insight"
                      : index === 1
                        ? "Activity insight"
                        : index === 2
                          ? "Team insight"
                          : "Facilitation insight",
                }}
                index={index}
              />
            ))}
          </div>
        </section>

        <ChartCard
          title="Workshop Summary"
          description="A concise picture of the workshop’s approach and emerging outcomes"
          index={0}
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Research focus
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This cohort showed strong growth in justice literacy, especially
                around structural inequality and the relationship between lived
                experience and collective action.
              </p>
            </div>
            <ul className="space-y-3">
              {workshopSummaryItems.map((item) => (
                <li
                  key={item.label}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{item.value}</p>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>

      <section aria-labelledby="quick-statistics">
        <SectionHeader
          title="Quick Statistics"
          description="A compact view of action readiness and impact breadth"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              id: "impact-areas",
              label: "High-Impact Themes",
              value: analytics.identityTopics.length,
              description:
                "Main identity themes surfaced in participant responses",
              color: "#E7436D",
            },
            {
              id: "prompted-action",
              label: "Action-Oriented Responses",
              value: "76%",
              description:
                "Participants expressed interest in continuing the work",
              color: "#339CFF",
            },
            {
              id: "follow-up-readiness",
              label: "Follow-Up Readiness",
              value: `${analytics.citizenSensitivity.change.toFixed(1)} / 5`,
              description:
                "Readiness for a second workshop or community activity",
              color: "#B07AE6",
            },
          ].map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
