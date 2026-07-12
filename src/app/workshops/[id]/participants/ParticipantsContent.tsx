"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { SurveyResponse } from "@/types";

interface ParticipantsContentProps {
  workshopId: string;
  responses: SurveyResponse[];
}

export function ParticipantsContent({ workshopId, responses }: ParticipantsContentProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return responses;
    const q = search.toLowerCase();
<<<<<<< HEAD
    return responses.filter((r) => (r.email || "").toLowerCase().includes(q));
=======
    return responses.filter((r) => r.id.toLowerCase().includes(q));
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  }, [responses, search]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Participants
        </h1>
        <p className="text-sm text-muted-foreground">
          {responses.length} matched participants across pre and post workshops.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search participants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((r, i) => {
          const preAvg = (r.pre.q5.caste + r.pre.q5.gender + r.pre.q5.religion) / 3;
          const postAvg = (r.post.q15.caste + r.post.q15.gender + r.post.q15.religion) / 3;
          const growth = postAvg - preAvg;

          return (
<<<<<<< HEAD
            <div key={r.email || i} className="rounded-xl border border-border/40 bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.email}</p>
=======
            <div key={r.id || i} className="rounded-xl border border-border/40 bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{r.id.replace(/-/g, " ")}</p>
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>A: {preAvg.toFixed(1)}</span>
                    <span>→</span>
                    <span>B: {((r.post.q14.caste + r.post.q14.gender + r.post.q14.religion) / 3).toFixed(1)}</span>
                    <span>→</span>
                    <span className="font-medium text-foreground">C: {postAvg.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${growth > 0 ? "text-[#44E6AD]" : growth < 0 ? "text-[#F08367]" : "text-muted-foreground"}`}>
                    {growth > 0 ? "+" : ""}{growth.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">growth</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No participants found.</p>
      )}
    </div>
  );
}
