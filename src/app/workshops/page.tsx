import { AppShell } from "@/components/layout/AppShell";
import { getWorkshops } from "@/services/workshops";
import { WorkshopList } from "./WorkshopList";

export const metadata = {
  title: "Workshops",
};

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <AppShell>
      <WorkshopList workshops={workshops} />
    </AppShell>
  );
}
