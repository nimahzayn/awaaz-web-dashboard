import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData } from "@/services/workshops";
import { computeAnalytics } from "@/services/analytics";
import { InsightsEmptyState } from "./InsightsEmptyState";
import { InsightsContent } from "./InsightsContent";

export const metadata = { title: "Insights" };

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await getWorkshop(id);
  if (!workshop) notFound();

  const dataStatus = await workshopHasData(id);
  if (!dataStatus.analysis) {
    return <InsightsEmptyState workshopId={id} />;
  }

  const analytics = await computeAnalytics(id);
  return <InsightsContent workshop={workshop} analytics={analytics} />;
}
