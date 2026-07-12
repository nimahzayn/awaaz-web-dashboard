import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData } from "@/services/workshops";
import { WorkshopSettingsContent } from "./WorkshopSettingsContent";

export const metadata = { title: "Workshop Settings" };

export default async function WorkshopSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await getWorkshop(id);
  if (!workshop) notFound();

  const dataStatus = await workshopHasData(id);

  return <WorkshopSettingsContent workshop={workshop} dataStatus={dataStatus} />;
}
