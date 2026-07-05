"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  description?: string;
  className?: string;
  index?: number;
}

export function ProgressCard({
  label,
  value,
  max = 5,
  color = "#E7436D",
  description,
  className,
  index = 0,
}: ProgressCardProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        className
      )}
      aria-label={`${label}: ${value} out of ${max}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">
          {value} / {max}
        </span>
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </motion.article>
  );
}
