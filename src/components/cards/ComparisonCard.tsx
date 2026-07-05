"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonCardProps {
  label: string;
  beforeValue: string | number;
  afterValue: string | number;
  beforeLabel?: string;
  afterLabel?: string;
  description?: string;
  className?: string;
  index?: number;
}

export function ComparisonCard({
  label,
  beforeValue,
  afterValue,
  beforeLabel = "Before",
  afterLabel = "After",
  description,
  className,
  index = 0,
}: ComparisonCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-sm",
        className
      )}
    >
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-muted p-3 text-center">
          <p className="text-xs text-muted-foreground">{beforeLabel}</p>
          <p className="mt-1 text-lg font-semibold">{beforeValue}</p>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="flex-1 rounded-xl bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">{afterLabel}</p>
          <p className="mt-1 text-lg font-semibold text-primary">{afterValue}</p>
        </div>
      </div>
    </motion.article>
  );
}
