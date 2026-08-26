"use client";

import type { AnalyticsSnapshot } from "@/types";

export function RecommendationsSection({ analytics }: { analytics: AnalyticsSnapshot }) {
  const sorted = [...analytics.dimensions].sort((a, b) => a.gain - b.gain);
  const lowest = sorted[0];
  const topActivity = analytics.activities[0];

  const recommendations: Array<{
    title: string;
    detail: string;
    type: "growth" | "strength" | "action";
  }> = [];

  if (lowest) {
    recommendations.push({
      title: `Deepen ${lowest.topic} Learning`,
      detail:
        lowest.gain < 0
          ? `Participants reported lower confidence in ${lowest.topic} after the workshop (${lowest.gain.toFixed(1)}). Consider revisiting how this dimension is facilitated.`
          : `Consider adding more activities focused on ${lowest.topic} where learning gains were smaller (+${lowest.gain.toFixed(1)}).`,
      type: "growth",
    });
  }

  if (topActivity) {
    recommendations.push({
      title: "Leverage Top Activities",
      detail: `"${topActivity.name}" received the highest rating (${topActivity.rating.toFixed(1)}/5). Use similar formats in future workshops.`,
      type: "strength",
    });
  }

  const challenge = analytics.collaboration?.challenges[0];
  if (challenge) {
    recommendations.push({
      title: "Address Team Dynamics",
      detail: `Teams identified "${challenge}" as a challenge. Consider targeted facilitation strategies.`,
      type: "action",
    });
  }

  const suggestion = analytics.facilitator?.suggestions[0];
  if (suggestion || (analytics.facilitator?.averageRating ?? null) !== null) {
    recommendations.push({
      title: "Sustain Facilitation Quality",
      detail: suggestion
        ? `Facilitator suggestion: "${suggestion}". Incorporate into future planning.`
        : `Facilitator scored ${analytics.facilitator?.averageRating?.toFixed(1)}/5 — maintain this approach.`,
      type: "strength",
    });
  }

  if (recommendations.length === 0 && sorted.length > 0) {
    const highest = sorted[sorted.length - 1];
    recommendations.push({
      title: `Build on ${highest.topic}`,
      detail: `${highest.topic} showed the strongest growth (+${highest.gain.toFixed(1)} points). Explore related dimensions in upcoming sessions.`,
      type: "strength",
    });
  }

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
        {recommendations.length === 0 && (
          <div className="rounded-2xl border border-border/40 bg-surface p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Not enough differentiated data to generate specific recommendations yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
