"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { DimensionMatch, ParticipantRecord } from "@/types";

interface ParticipantsContentProps {
  workshopId: string;
  responses: ParticipantRecord[];
  dimensions: DimensionMatch[];
}

function stageAverage(
  record: ParticipantRecord,
  stage: "a" | "b" | "c",
  dimensions: DimensionMatch[]
): number | null {
  const keyForStage = (d: DimensionMatch) =>
    stage === "a" ? d.a.key : stage === "b" ? d.b.key : d.c.key;

  const values: number[] = [];
  for (const dim of dimensions) {
    const v = record.answers[stage]?.[keyForStage(dim)];
    if (typeof v === "number") values.push(v);
  }
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function ParticipantsContent({ responses, dimensions }: ParticipantsContentProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return responses;
    const q = search.toLowerCase();
    return responses.filter((r) => {
      const label = r.name || r.participantId;
      return label.toLowerCase().includes(q);
    });
  }, [responses, search]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Participants
        </h1>
        <p className="text-sm text-muted-foreground">
          {responses.length} matched participants across Forms A, B, and C.
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
          const aAvg = stageAverage(r, "a", dimensions);
          const bAvg = stageAverage(r, "b", dimensions);
          const cAvg = stageAverage(r, "c", dimensions);
          if (aAvg === null || bAvg === null || cAvg === null) return null;
          const growth = cAvg - aAvg;

          return (
            <div key={r.participantId || i} className="rounded-xl border border-border/40 bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name || r.participantId}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>A: {aAvg.toFixed(1)}</span>
                    <span>→</span>
                    <span>B: {bAvg.toFixed(1)}</span>
                    <span>→</span>
                    <span className="font-medium text-foreground">C: {cAvg.toFixed(1)}</span>
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
