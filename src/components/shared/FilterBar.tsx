"use client";

import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/types";

interface FilterBarProps {
  workshops?: FilterOption[];
  cohorts?: FilterOption[];
  className?: string;
}

export function FilterBar({
  workshops,
  cohorts,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm",
        className
      )}
      role="group"
      aria-label="Data filters"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">Filters</span>
      </div>

      {workshops && (
        <select
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Select workshop"
          defaultValue={workshops[0]?.value}
          disabled
        >
          {workshops.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {cohorts && (
        <select
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Select cohort"
          defaultValue={cohorts[0]?.value}
          disabled
        >
          {cohorts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      <span className="ml-auto text-xs text-muted-foreground">
        Filters will be active when data is connected
      </span>
    </div>
  );
}
