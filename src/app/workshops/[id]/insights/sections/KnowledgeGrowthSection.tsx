"use client";

import type { AnalyticsSnapshot } from "@/types";

export function KnowledgeGrowthSection({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Knowledge Growth</p>
        <h2 className="text-2xl font-semibold text-foreground">Skills & Competency Development</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Post-workshop competency levels across key skill areas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analytics.skills.map((skill) => (
          <div key={skill.name} className="rounded-2xl border border-border/60 bg-surface p-5">
            <p className="text-sm font-medium text-foreground">{skill.name}</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground">{Math.round(skill.value)}</span>
              <span className="mb-1 text-xs text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${skill.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface p-6">
        <h3 className="text-sm font-semibold text-foreground">Identity & Confidence Growth</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-primary/5 p-4 text-center">
            <p className="text-2xl font-bold text-primary">+{analytics.identityGrowth}</p>
            <p className="mt-1 text-xs text-muted-foreground">Identity Understanding Growth</p>
          </div>
          <div className="rounded-xl bg-teal-light p-4 text-center">
            <p className="text-2xl font-bold text-teal">+{analytics.problemSolvingGrowth}</p>
            <p className="mt-1 text-xs text-muted-foreground">Problem Solving Growth</p>
          </div>
        </div>
      </div>
    </section>
  );
}
