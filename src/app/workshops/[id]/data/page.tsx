import { redirect } from "next/navigation";

/** Legacy Add Data URL — uploads live under Settings. */
export default async function WorkshopDataPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/workshops/${id}/settings`);
}
