import { AppShell } from "@/components/layout/AppShell";
import { CreateWorkshopForm } from "./CreateWorkshopForm";

<<<<<<< HEAD
export const metadata = { title: "Create Workshop" };

export default function NewWorkshopPage() {
=======
export const metadata = {
  title: "Create Workshop",
};

export default function CreateWorkshopPage() {
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  return (
    <AppShell>
      <CreateWorkshopForm />
    </AppShell>
  );
}
