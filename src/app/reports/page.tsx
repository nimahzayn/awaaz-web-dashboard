import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { REPORTS } from "@/constants/placeholder-data";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, Lock } from "lucide-react";

export const metadata = {
  title: "Impact Reports",
};

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Impact Reports"
        description="Generate and download workshop impact reports. PDF summaries and CSV data exports will be available once analytics are connected."
        badge="Export Center"
      />

      <section aria-labelledby="available-reports">
        <SectionHeader
          title="Available Reports"
          description="Report templates ready for data integration"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {REPORTS.map((report) => {
            const Icon = report.format === "PDF" ? FileText : FileSpreadsheet;

            return (
              <article
                key={report.id}
                className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      report.format === "PDF"
                        ? "bg-primary/10 text-primary"
                        : "bg-green/10 text-green"
                    }`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {report.title}
                      </h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {report.format}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Includes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.sections.map((section) => (
                      <span
                        key={section}
                        className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Button disabled className="gap-2 opacity-60">
                    <Download className="h-4 w-4" />
                    Download {report.format}
                  </Button>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Available after data connection
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="export-info"
        className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center"
      >
        <FileText
          className="mx-auto h-10 w-10 text-muted-foreground/50"
          aria-hidden="true"
        />
        <h3 className="mt-3 text-base font-semibold text-foreground">
          Reports Coming Soon
        </h3>
        <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
          Once Google Forms data is connected and analytics calculations are
          implemented, you&apos;ll be able to generate comprehensive PDF reports
          and export raw CSV data for further analysis.
        </p>
      </section>
    </div>
  );
}
