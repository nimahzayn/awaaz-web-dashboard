import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { MetricCard } from "@/components/cards/MetricCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import {
  DASHBOARD_METRICS,
  DASHBOARD_INSIGHTS,
  PLACEHOLDER_WORKSHOP,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
  LEARNING_IMPACT_GROUPED,
  SENTIMENT_DATA,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const overviewData = LEARNING_IMPACT_GROUPED.map((d) => ({
    name: d.name,
    value: d.C as number,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Executive overview of Justice Innovation workshop impact. Review key metrics, participant engagement, and emerging insights."
        badge={PLACEHOLDER_WORKSHOP.name}
      >
        <Link href="/learning-impact">
          <Button variant="outline" className="gap-2">
            View Learning Impact
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <section aria-labelledby="kpi-heading">
        <SectionHeader
          title="Key Performance Indicators"
          description={`${PLACEHOLDER_WORKSHOP.cohort} · ${PLACEHOLDER_WORKSHOP.date} · ${PLACEHOLDER_WORKSHOP.location}`}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DASHBOARD_METRICS.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Post-Workshop Understanding by Topic"
          description="Average C-stage scores across learning domains"
          index={0}
        >
          <BarChart
            data={overviewData}
            color={BRAND_COLORS.green}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Participant Sentiment"
          description="Emotional responses after the workshop"
          index={1}
        >
          <DonutChart data={SENTIMENT_DATA} height={280} />
        </ChartCard>
      </div>

      <section aria-labelledby="insights-heading">
        <SectionHeader
          title="Key Insights"
          description="Emerging patterns from participant responses"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_INSIGHTS.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
