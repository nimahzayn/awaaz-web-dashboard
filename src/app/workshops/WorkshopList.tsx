"use client";

import Link from "next/link";
<<<<<<< HEAD
import { Plus, ArrowRight, Loader2, CheckCircle2, FileUp } from "lucide-react";
=======
import { Plus, ArrowRight, Loader2, CheckCircle2, Clock, FileUp } from "lucide-react";
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
import type { Workshop } from "@/types";

interface WorkshopListProps {
  workshops: Workshop[];
}

const statusConfig = {
  draft: { label: "Awaiting Survey Upload", icon: FileUp, color: "text-muted-foreground", bg: "bg-muted" },
  uploaded: { label: "Processing...", icon: Loader2, color: "text-blue", bg: "bg-blue/10" },
  analyzed: { label: "Completed", icon: CheckCircle2, color: "text-[#44E6AD]", bg: "bg-[#44E6AD]/10" },
};

export function WorkshopList({ workshops }: WorkshopListProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="font-[family-name:var(--font-display)] text-[52px] leading-[1.1] text-primary">
          Workshop Analysis
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
          Transform workshop responses into meaningful insights, uncover learning patterns, and generate AI-powered impact reports.
        </p>
      </div>

<<<<<<< HEAD
=======
      <div>
        <Link
          href="/workshops/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Workshop
        </Link>
      </div>

>>>>>>> eca607128818d652d280ea17157714cd56e4476f
      {workshops.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-surface px-12 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
            <Plus className="h-7 w-7 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No workshops yet</h3>
          <p className="mt-2 max-w-sm mx-auto text-sm leading-relaxed text-muted-foreground">
            Create your first workshop to begin uploading survey data and generating AI-powered insights.
          </p>
          <Link
            href="/workshops/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create your first workshop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((ws) => {
            const status = statusConfig[ws.status];
            const StatusIcon = status.icon;
            return (
              <Link
                key={ws.id}
                href={`/workshops/${ws.id}/overview`}
                className="group flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-6 py-5 transition-all hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex items-center gap-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {ws.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                      {ws.status === "analyzed" && (
                        <>
                          <span>{ws.matchedCount} participants</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                        </>
                      )}
                      {ws.location && <span>{ws.location}</span>}
                      {ws.date && <span>{ws.date}</span>}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
