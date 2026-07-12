"use client";

import type { TopicMetric } from "@/types";

export function PerceptionShiftSection({ topics }: { topics: TopicMetric[] }) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Perception Shift</p>
        <h2 className="text-2xl font-semibold text-foreground">Misconception Correction</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          How participants revised their initial assumptions through the workshop experience.
        </p>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => {
          const gap = topic.a - topic.b;
          return (
            <div key={topic.topic} className="rounded-2xl border border-border/60 bg-surface p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{topic.topic}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{topic.insight}</p>
                </div>
                {gap > 0 && (
                  <span className="rounded-full bg-[#F08367]/10 px-3 py-1 text-xs font-medium text-[#F08367]">
                    +{gap.toFixed(1)} gap
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Before (A)</span>
                    <span>{topic.a.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: `${(topic.a / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Retrospective (B)</span>
                    <span>{topic.b.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[#F08367]" style={{ width: `${(topic.b / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>After (C)</span>
                    <span className="font-semibold text-foreground">{topic.c.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(topic.c / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
