import { notFound } from "next/navigation";
import { getWorkshop, workshopHasData, readWorkshopFile } from "@/services/workshops";
import { ParticipantsContent } from "./ParticipantsContent";

export const metadata = { title: "Participants" };

export default async function ParticipantsPage({
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
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Participants</h1>
        <p className="text-sm text-muted-foreground">Upload survey data and generate analysis to view participant details.</p>
      </div>
    );
  }

  const responses = await readWorkshopFile(id, "survey_responses.json");
  return <ParticipantsContent workshopId={id} responses={responses || []} />;
}
