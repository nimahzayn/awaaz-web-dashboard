import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ThemeCard } from "@/components/cards/ThemeCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import {
  SKILLS_DEVELOPED,
  JUSTICE_THEMES,
  OPEN_ENDED_RESPONSES,
  FILTER_WORKSHOPS,
  FILTER_COHORTS,
  DASHBOARD_INSIGHTS,
} from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";

export const metadata = {
  title: "Skills & Justice Learning",
};

export default function SkillsJusticeLearningPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Skills & Justice Learning"
        description="Discover which skills participants developed and the justice learning themes that emerged from workshop activities and discussions."
        badge="Skills & Themes"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <ChartCard
        title="Skills Developed"
        description="Skills participants reported developing during the workshop"
        index={0}
      >
        <HorizontalBarChart
          data={SKILLS_DEVELOPED}
          color={BRAND_COLORS.green}
          height={300}
        />
      </ChartCard>

      <section aria-labelledby="justice-themes">
        <SectionHeader
          title="Justice Learning Themes"
          description="Recurring themes in participant reflections"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {JUSTICE_THEMES.map((theme, index) => (
            <ThemeCard key={theme.id} theme={theme} index={index} />
          ))}
        </div>
      </section>

      <section aria-labelledby="open-responses">
        <SectionHeader
          title="Open-ended Responses"
          description="Selected participant reflections on justice learning"
        />
        <div className="mt-4 space-y-3">
          {OPEN_ENDED_RESPONSES.map((response, index) => (
            <blockquote
              key={index}
              className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted-foreground leading-relaxed italic"
            >
              &ldquo;{response}&rdquo;
            </blockquote>
          ))}
        </div>
      </section>

      <section aria-labelledby="learning-insights">
        <SectionHeader
          title="Learning Insights"
          description="Patterns emerging from skills and theme analysis"
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
