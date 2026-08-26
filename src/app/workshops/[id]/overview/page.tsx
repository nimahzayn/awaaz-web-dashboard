import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData, getAnalytics } from "@/services/workshops";
import type { AnalyticsSnapshot } from "@/types";
import { WorkshopOverviewContent } from "./WorkshopOverviewContent";

export const metadata = { title: "Overview" };

export default async function WorkshopOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await getWorkshop(id);
  if (!workshop) notFound();

  const dataStatus = await workshopHasData(id);

  if (dataStatus.analysis) {
    const analytics = (await getAnalytics(id)) as AnalyticsSnapshot | null;
    return (
      <WorkshopOverviewContent
        workshop={workshop}
        analytics={analytics}
        hasData={!!analytics}
        dataStatus={dataStatus}
      />
    );
  }

  return (
    <WorkshopOverviewContent
      workshop={workshop}
      analytics={null}
      hasData={false}
      dataStatus={dataStatus}
    />
  );
}
