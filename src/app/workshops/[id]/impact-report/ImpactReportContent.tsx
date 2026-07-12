"use client";

import type { Workshop, AnalyticsSnapshot } from "@/types";
import { Download, FileText, Share2, MapPin, Calendar, Users, TrendingUp } from "lucide-react";

interface ImpactReportContentProps {
  workshop: Workshop;
  analytics: AnalyticsSnapshot;
}

export function ImpactReportContent({ workshop, analytics }: ImpactReportContentProps) {
  const impactLevel = analytics.workshopImpactScore >= 75 ? "High" : analytics.workshopImpactScore >= 50 ? "Moderate" : "Low";

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
            Impact Report
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {workshop.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{workshop.location}</span>}
            {workshop.date && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{workshop.date}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <FileText className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-surface to-surface/80 p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">AI Executive Summary</p>
        <p className="text-base leading-relaxed text-muted-foreground max-w-3xl">
          {analytics.educatorInsights.join(" ")}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface p-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#E8E8E4" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke="#44E6AD" strokeWidth="8" strokeLinecap="round"
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
            <h3 className="text-lg font-semibold text-foreground">Workshop Impact Score</h3>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#44E6AD]/10 px-3 py-1 text-sm font-medium text-[#2a9d8f]">
              {impactLevel} Impact
            </span>
            <p className="text-sm text-muted-foreground">
              Based on participant growth, satisfaction, and learning outcomes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Participants", value: analytics.participants, icon: Users },
          { label: "Satisfaction", value: `${analytics.overallSatisfaction}/5`, icon: TrendingUp },
          { label: "Learning Gain", value: `+${analytics.learningGainIndex}`, icon: TrendingUp },
          { label: "Identity Growth", value: `+${analytics.identityGrowth}`, icon: TrendingUp },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border/60 bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Learning Journey Summary</h3>
        <div className="rounded-2xl border border-border/60 bg-surface p-6">
          <div className="flex items-center justify-between">
            {analytics.identityTopics.map((t) => (
              <div key={t.topic} className="text-center">
                <p className="text-xs text-muted-foreground">{t.topic}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{t.a.toFixed(1)} → {t.c.toFixed(1)}</p>
                <p className="text-xs text-primary">+{t.gain.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
