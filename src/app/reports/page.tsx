import { AppShell } from "@/components/layout/AppShell";
import { getWorkshops } from "@/services/workshops";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const workshops = await getWorkshops();
  const analyzed = workshops.filter((w) => w.status === "analyzed");

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Access impact reports for your analyzed workshops.</p>
        </div>

        {analyzed.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-surface px-12 py-20 text-center">
            <FileText className="mx-auto mb-4 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No reports available</p>
            <p className="mt-1 text-xs text-muted-foreground">Analyze a workshop to generate its impact report.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyzed.map((ws) => (
              <Link
                key={ws.id}
                href={`/workshops/${ws.id}/impact-report`}
                className="group flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-6 py-5 transition-all hover:border-primary/20 hover:shadow-md"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{ws.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{ws.matchedCount} participants · {ws.location} · {ws.date}</p>
                </div>
                <span className="text-sm font-medium text-primary">View Report →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
