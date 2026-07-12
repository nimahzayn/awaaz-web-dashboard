"use client";

import Link from "next/link";
import type { Workshop, AnalyticsSnapshot } from "@/types";
<<<<<<< HEAD
import { Upload, MapPin, Calendar, ArrowRight, Sparkles } from "lucide-react";
=======
import { Upload, MapPin, Calendar, Users, ArrowRight, Sparkles } from "lucide-react";
>>>>>>> eca607128818d652d280ea17157714cd56e4476f

interface WorkshopOverviewContentProps {
  workshop: Workshop;
  analytics: AnalyticsSnapshot | null;
  hasData: boolean;
}

export function WorkshopOverviewContent({ workshop, analytics, hasData }: WorkshopOverviewContentProps) {
  if (!hasData || !analytics) {
    return (
      <div className="space-y-10">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {workshop.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {workshop.location}
              </span>
            )}
            {workshop.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {workshop.date}
              </span>
            )}
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Draft
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
            {workshop.name}
          </h1>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface px-12 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
            <Upload className="h-7 w-7 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No survey data uploaded yet</h3>
          <p className="mt-2 max-w-md mx-auto text-sm leading-relaxed text-muted-foreground">
            Upload your Pre-Workshop and Post-Workshop survey sheets to begin generating participant insights, learning journeys, and impact reports.
          </p>
          <Link
            href={`/workshops/${workshop.id}/settings`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Upload className="h-4 w-4" />
            Upload Survey Files
          </Link>
        </div>
      </div>
    );
  }

  const impactLevel = analytics.workshopImpactScore >= 75 ? "High" : analytics.workshopImpactScore >= 50 ? "Moderate" : "Low";
  const impactColor = analytics.workshopImpactScore >= 75 ? "#44E6AD" : analytics.workshopImpactScore >= 50 ? "#FFBA4C" : "#F08367";

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {workshop.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {workshop.location}
            </span>
          )}
          {workshop.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {workshop.date}
            </span>
          )}
          <span className="rounded-full bg-[#44E6AD]/10 px-2.5 py-0.5 text-xs font-medium text-[#44E6AD]">
            Analyzed
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
          {workshop.name}
        </h1>
      </div>

      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-surface to-surface/80 p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">AI Workshop Summary</p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {analytics.educatorInsights[0]} {analytics.educatorInsights[1]} {analytics.educatorInsights[2]}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface p-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#E8E8E4" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke={impactColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(analytics.workshopImpactScore / 100) * 377} 377`}
                transform="rotate(-90 70 70)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{analytics.workshopImpactScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-foreground">Workshop Impact</h3>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${impactColor}15` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: impactColor }} />
              <span className="text-sm font-medium" style={{ color: impactColor }}>{impactLevel} Impact</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Overall satisfaction: <span className="font-semibold text-foreground">{analytics.overallSatisfaction}/5</span> · Learning gain: <span className="font-semibold text-foreground">+{analytics.learningGainIndex}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Participants", value: analytics.participants, color: "#339CFF" },
          { label: "Completion Rate", value: `${analytics.completedSurveys}/${analytics.participants}`, color: "#44E6AD" },
          { label: "Satisfaction", value: `${analytics.overallSatisfaction}/5`, color: "#E8126E" },
          { label: "Learning Gain", value: `+${analytics.learningGainIndex}`, color: "#B07AE6" },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border/60 bg-surface p-5">
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">AI Recommendations</h3>
        <div className="space-y-2">
          {analytics.educatorInsights.map((insight, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border/40 bg-surface p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/workshops/${workshop.id}/insights`}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
      >
        View Full Insights
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
