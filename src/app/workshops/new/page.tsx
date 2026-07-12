import { AppShell } from "@/components/layout/AppShell";
import { CreateWorkshopForm } from "./CreateWorkshopForm";

export const metadata = {
  title: "Create Workshop",
};

export default function CreateWorkshopPage() {
  return (
    <AppShell>
      <CreateWorkshopForm />
    </AppShell>
  );
}
