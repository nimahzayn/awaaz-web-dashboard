"use client";

import type { AnalyticsSnapshot } from "@/types";
import { TrendingUp } from "lucide-react";

export function LearningJourneySection({ analytics }: { analytics: AnalyticsSnapshot }) {
  const allTopics = [...analytics.identityTopics, analytics.creativePedagogy, analytics.problemSolving];
  const avgA = allTopics.reduce((s, t) => s + t.a, 0) / allTopics.length;
  const avgB = allTopics.reduce((s, t) => s + t.b, 0) / allTopics.length;
  const avgC = allTopics.reduce((s, t) => s + t.c, 0) / allTopics.length;
  const growthPct = avgA > 0 ? Math.round(((avgC - avgA) / avgA) * 100) : 0;

  const stages = [
    { label: "A", title: "Original Understanding", value: avgA, desc: "Before the workshop" },
    { label: "B", title: "Retrospective Reflection", value: avgB, desc: "Revised pre-workshop view" },
    { label: "C", title: "Current Understanding", value: avgC, desc: "After the workshop" },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Learning Journey</p>
        <h2 className="text-2xl font-semibold text-foreground">The A → B → C Framework</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
<<<<<<< HEAD
          One of Awaaz Labs&apos; defining features: measuring how participants&apos; understanding evolves from their original view, through retrospective reflection, to post-workshop knowledge.
=======
          One of Awaaz Labs' defining features: measuring how participants&apos; understanding evolves from their original view, through retrospective reflection, to post-workshop knowledge.
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {stages.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                    {stage.label}
                  </div>
                  <p className="text-xl font-bold text-foreground">{stage.value.toFixed(1)}</p>
                  <p className="mt-1 text-xs font-medium text-foreground">{stage.title}</p>
                  <p className="text-[10px] text-muted-foreground">{stage.desc}</p>
                </div>
                {i < stages.length - 1 && (
                  <div className="mt-[-20px] flex flex-col items-center">
                    <div className="h-[2px] w-12 bg-border" />
                    <TrendingUp className="mt-1 h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-primary/5 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-primary">+{growthPct}%</p>
            <p className="text-xs text-muted-foreground">Overall Growth</p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Participants demonstrated significant conceptual growth after the workshop. The retrospective step (B) reveals that initial self-assessments were often higher than actual understanding, and the post-workshop measurement (C) shows genuine learning.
        </p>
      </div>

      <div className="space-y-3">
        {allTopics.map((topic) => (
          <div key={topic.topic} className="flex items-center gap-4 rounded-xl border border-border/40 bg-surface p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{topic.topic}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>A: {topic.a.toFixed(1)}</span>
                <span>→</span>
                <span>B: {topic.b.toFixed(1)}</span>
                <span>→</span>
                <span className="font-semibold text-foreground">C: {topic.c.toFixed(1)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">+{topic.gain.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">gain</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
