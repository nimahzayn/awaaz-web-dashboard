import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "./SettingsForm";
import { getUploadStatus } from "./actions";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const status = await getUploadStatus();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Upload Pre-Workshop and Post-Workshop CSV/XLSX spreadsheets to update the dashboard dataset."
        badge="Configuration"
      />

      <SettingsForm initialStatus={status} />
    </div>
  );
}
