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
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { getUploadStatus } from "../settings/actions";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Workshop Experience",
};

export default async function WorkshopExperiencePage() {
  const status = await getUploadStatus();
  const hasData = status.preUploaded || status.postUploaded;

  if (!hasData) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Workshop Experience"
          description="Understand overall participant satisfaction, willingness to recommend, and emotional responses to the Justice Innovation workshop experience."
          badge="Experience & Sentiment"
        />

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No data uploaded yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload your pre and post workshop survey files to see experience metrics and sentiment analysis.
          </p>
          <Link href="/settings" className="mt-5">
            <Button className="gap-2">
              Upload Data
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const satisfactionBreakdown = [
    { name: "Content Quality", value: 0 },
    { name: "Activity Design", value: 0 },
    { name: "Facilitation", value: 0 },
    { name: "Pace & Timing", value: 0 },
    { name: "Materials", value: 0 },
    { name: "Safe Space", value: 0 },
  ];

  const recommendData = [
    { name: "Yes", value: 0 },
    { name: "Maybe", value: 0 },
    { name: "No", value: 0 },
  ];

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
          {[
            {
              id: "overall",
              label: "Overall Rating",
              value: "— / 5",
              description: "General workshop satisfaction",
              color: BRAND_COLORS.primary,
            },
            {
              id: "recommend",
              label: "Would Recommend",
              value: "—",
              description: "Participants who would recommend",
              color: BRAND_COLORS.green,
            },
            {
              id: "continue",
              label: "Continue Building Ideas",
              value: "—",
              description: "Want to continue justice work",
              color: BRAND_COLORS.blue,
            },
            {
              id: "satisfaction",
              label: "Overall Satisfaction",
              value: "— / 5",
              description: "End-to-end experience rating",
              color: BRAND_COLORS.purple,
            },
          ].map((metric, index) => (
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
        <LikertPlaceholder data={[]} />
      </ChartCard>
    </div>
  );
}
