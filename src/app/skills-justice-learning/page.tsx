import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { ChartCard } from "@/components/cards/ChartCard";
import { ThemeCard } from "@/components/cards/ThemeCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";
import { BRAND_COLORS } from "@/constants/colors";
import { computeAnalytics } from "@/services/analytics";

export const metadata = {
  title: "Skills & Justice Learning",
};

export default async function SkillsJusticeLearningPage() {
  const analytics = await computeAnalytics();
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
          data={analytics.skills.map((skill) => ({
            name: skill.name,
            value: skill.value,
          }))}
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
          {[
            {
              id: "structural",
              title: "Structural Inequality",
              count: 24,
              description:
                "Recognizing systemic barriers beyond individual actions",
              color: BRAND_COLORS.primary,
            },
            {
              id: "intersectionality",
              title: "Intersectionality",
              count: 19,
              description:
                "Understanding overlapping identity-based discrimination",
              color: BRAND_COLORS.purple,
            },
            {
              id: "solidarity",
              title: "Community Solidarity",
              count: 16,
              description: "Building collective action for justice",
              color: BRAND_COLORS.blue,
            },
            {
              id: "policy",
              title: "Policy & Governance",
              count: 12,
              description:
                "Connecting lived experience to institutional change",
              color: BRAND_COLORS.coral,
            },
          ].map((theme, index) => (
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
          {analytics.educatorInsights.map((response, index) => (
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
          {analytics.learningGainInsights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
