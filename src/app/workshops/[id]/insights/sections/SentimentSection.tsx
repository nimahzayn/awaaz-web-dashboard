"use client";

import type { AnalyticsSnapshot } from "@/types";

export function SentimentSection({ analytics }: { analytics: AnalyticsSnapshot }) {
  const tc = analytics.teamCollaboration;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sentiment & Collaboration</p>
        <h2 className="text-2xl font-semibold text-foreground">Participant Experience</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Team dynamics, facilitator performance, and overall satisfaction.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs text-muted-foreground">Ideas Heard</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{tc.ideasHeard}/5</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs text-muted-foreground">Respect for Diverse Perspectives</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{tc.respect}/5</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs text-muted-foreground">Team Preference</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{tc.teamPreference}/5</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs text-muted-foreground">Facilitator Rating</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{analytics.facilitator.averageRating}/5</p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>Safe Environment: {analytics.facilitator.safeEnvironment}/5</span>
            <span>Clear Instructions: {analytics.facilitator.clearInstructions}/5</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs text-muted-foreground">Overall Satisfaction</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{analytics.overallSatisfaction}/5</p>
          <div className="mt-2">
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(analytics.overallSatisfaction / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {tc.strengths.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Strengths</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...new Set(tc.strengths)].slice(0, 10).map((s, i) => (
              <span key={i} className="rounded-full bg-[#44E6AD]/10 px-3 py-1 text-xs font-medium text-[#2a9d8f]">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {tc.challenges.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Challenges</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...new Set(tc.challenges)].slice(0, 10).map((c, i) => (
              <span key={i} className="rounded-full bg-[#F08367]/10 px-3 py-1 text-xs font-medium text-[#F08367]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
