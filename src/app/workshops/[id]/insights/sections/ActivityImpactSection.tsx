"use client";

import type { AnalyticsSnapshot } from "@/types";

export function ActivityImpactSection({ activities }: { activities: AnalyticsSnapshot["activities"] }) {
  const max = Math.max(...activities.map((a) => a.rating), 1);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Activity Impact</p>
        <h2 className="text-2xl font-semibold text-foreground">Workshop Activity Ratings</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          How participants rated each workshop activity.
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.name} className="flex items-center gap-4 rounded-xl border border-border/40 bg-surface p-4">
            <div className="min-w-[140px]">
              <p className="text-sm font-medium text-foreground">{activity.name}</p>
              <p className="text-[10px] text-muted-foreground">{activity.category}</p>
            </div>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(activity.rating / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="w-10 text-right text-sm font-bold text-foreground">{activity.rating.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
