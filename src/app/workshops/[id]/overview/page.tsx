import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData } from "@/services/workshops";
import { computeAnalytics } from "@/services/analytics";
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

  if (workshop.status === "analyzed") {
    const analytics = await computeAnalytics(id);
    return <WorkshopOverviewContent workshop={workshop} analytics={analytics} hasData={true} />;
  }

  return <WorkshopOverviewContent workshop={workshop} analytics={null} hasData={false} />;
}
