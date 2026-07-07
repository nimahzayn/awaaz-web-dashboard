import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { MetricCard } from "@/components/cards/MetricCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { FilterBar } from "@/components/shared/FilterBar";
import { FILTER_WORKSHOPS, FILTER_COHORTS } from "@/constants/placeholder-data";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Research context and platform preferences for the workshop impact experience."
        badge="Configuration"
      />

      <FilterBar workshops={FILTER_WORKSHOPS} cohorts={FILTER_COHORTS} />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          metric={{
            id: "research-mode",
            label: "Research Mode",
            value: "Placeholder data",
            description: "Educational insights only — no external integrations",
          }}
          index={0}
        />
        <MetricCard
          metric={{
            id: "display-mode",
            label: "Preferred View",
            value: "Warm editorial",
            description: "Minimal, premium, and spacious presentation",
          }}
          index={1}
        />
        <MetricCard
          metric={{
            id: "data-source",
            label: "Data Source",
            value: "Local placeholders",
            description:
              "No APIs, Google Sheets, or live analytics connections",
          }}
          index={2}
        />
      </div>

      <ChartCard
        title="Platform Intent"
        description="This experience is designed as an educational research and reflection environment rather than a traditional admin dashboard."
        index={0}
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            • The interface prioritizes clarity, warmth, and thoughtful
            storytelling.
          </p>
          <p>
            • Charts remain reusable and prop-driven for future data connection.
          </p>
          <p>
            • All content currently uses placeholder educational data to focus
            on UX and architecture.
          </p>
        </div>
      </ChartCard>
    </div>
  );
}
