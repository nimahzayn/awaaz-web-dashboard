import { AppShell } from "@/components/layout/AppShell";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your platform preferences.</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">About</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Workshop Analysis by Awaaz Leadership Labs</p>
            <p>AI-powered platform for measuring workshop impact and participant learning outcomes.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
