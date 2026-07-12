<<<<<<< HEAD
import { notFound } from "next/navigation";
=======
import { notFound, redirect } from "next/navigation";
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
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
