import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData, getAnalytics } from "@/services/workshops";
import type { AnalyticsSnapshot } from "@/types";
import { ImpactReportContent } from "./ImpactReportContent";

export const metadata = { title: "Impact Report" };

export default async function ImpactReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await getWorkshop(id);
  if (!workshop) notFound();

  const dataStatus = await workshopHasData(id);
  if (!dataStatus.analysis) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Impact Report</h1>
        <p className="text-sm text-muted-foreground">Generate analysis first to view the impact report.</p>
      </div>
    );
  }

  const analytics = (await getAnalytics(id)) as AnalyticsSnapshot | null;
  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Impact Report</h1>
        <p className="text-sm text-muted-foreground">Generate analysis first to view the impact report.</p>
      </div>
    );
  }

  return <ImpactReportContent workshop={workshop} analytics={analytics} />;
}
