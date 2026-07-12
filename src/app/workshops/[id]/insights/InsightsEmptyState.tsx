"use client";

import Link from "next/link";
import { Upload } from "lucide-react";

export function InsightsEmptyState({ workshopId }: { workshopId: string }) {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
        Insights
      </h1>
      <div className="rounded-2xl border border-border/60 bg-surface px-12 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
          <Upload className="h-7 w-7 text-primary/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No analysis available</h3>
        <p className="mt-2 max-w-md mx-auto text-sm leading-relaxed text-muted-foreground">
          Upload both Pre-Workshop and Post-Workshop surveys and generate analysis to view insights.
        </p>
        <Link
          href={`/workshops/${workshopId}/settings`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Upload Surveys
        </Link>
      </div>
    </div>
  );
}
