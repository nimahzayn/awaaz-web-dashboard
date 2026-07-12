import { notFound } from "next/navigation";
import { getWorkshop } from "@/services/workshops";
import { AppShell } from "@/components/layout/AppShell";

export default async function WorkshopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await getWorkshop(id);
  if (!workshop) notFound();

  return (
    <AppShell workshopId={workshop.id} workshopName={workshop.name}>
      {children}
    </AppShell>
  );
}
