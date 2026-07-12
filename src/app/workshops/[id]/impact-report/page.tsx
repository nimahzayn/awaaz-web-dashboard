import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData } from "@/services/workshops";
import { computeAnalytics } from "@/services/analytics";
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

  const analytics = await computeAnalytics(id);
  return <ImpactReportContent workshop={workshop} analytics={analytics} />;
}
