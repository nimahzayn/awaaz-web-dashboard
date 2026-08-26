import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData, getAnalytics } from "@/services/workshops";
import type { AnalyticsSnapshot } from "@/types";
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

  const analytics = (await getAnalytics(id)) as AnalyticsSnapshot | null;
  if (!analytics) {
    return <InsightsEmptyState workshopId={id} />;
  }

  return <InsightsContent workshop={workshop} analytics={analytics} />;
}
