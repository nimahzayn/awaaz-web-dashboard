"use client";

import type { AnalyticsSnapshot } from "@/types";
import { Sparkles, ArrowRight } from "lucide-react";

export function RecommendationsSection({ analytics }: { analytics: AnalyticsSnapshot }) {
  const recommendations = [
    {
      title: "Deepen Identity Learning",
      detail: `Consider adding more activities focused on ${analytics.identityTopics.sort((a, b) => a.gain - b.gain)[0]?.topic || "key topics"} where learning gains were smaller.`,
      type: "growth" as const,
    },
    {
      title: "Leverage Top Activities",
      detail: `"${analytics.activities[0]?.name}" received the highest rating (${analytics.activities[0]?.rating.toFixed(1)}/5). Use similar formats in future workshops.`,
      type: "strength" as const,
    },
    {
      title: "Address Team Dynamics",
      detail: analytics.teamCollaboration.challenges[0]
        ? `Teams identified "${analytics.teamCollaboration.challenges[0]}" as a challenge. Consider targeted facilitation strategies.`
        : "Team collaboration is performing well across all dimensions.",
      type: "action" as const,
    },
    {
      title: "Sustain Facilitation Quality",
      detail: analytics.facilitator.suggestions[0]
        ? `Facilitator suggestion: "${analytics.facilitator.suggestions[0]}". Incorporate into future planning.`
        : `Facilitator scored ${analytics.facilitator.averageRating}/5 — maintain this approach.`,
      type: "strength" as const,
    },
  ];

  const typeColors = {
    growth: { bg: "bg-primary/5", dot: "bg-primary" },
    strength: { bg: "bg-[#44E6AD]/5", dot: "bg-[#44E6AD]" },
    action: { bg: "bg-[#FFBA4C]/5", dot: "bg-[#FFBA4C]" },
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Recommendations</p>
        <h2 className="text-2xl font-semibold text-foreground">AI-Powered Suggestions</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Personalized recommendations based on your workshop data.
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const colors = typeColors[rec.type];
          return (
            <div key={i} className={`flex gap-4 rounded-2xl border border-border/40 bg-surface p-5 ${colors.bg}`}>
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{rec.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
