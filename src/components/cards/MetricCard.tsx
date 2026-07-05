"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricData } from "@/types";

interface MetricCardProps {
  metric: MetricData;
  index?: number;
  className?: string;
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function MetricCard({ metric, index = 0, className }: MetricCardProps) {
  const TrendIcon = metric.trend ? trendIcons[metric.trend] : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
      aria-label={`${metric.label}: ${metric.value}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>
        </div>
        {metric.color && (
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full mt-1.5"
            style={{ backgroundColor: metric.color }}
            aria-hidden="true"
          />
        )}
      </div>
      {metric.description && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          {metric.description}
        </p>
      )}
      {metric.trend && metric.trendLabel && TrendIcon && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{metric.trendLabel}</span>
        </div>
      )}
    </motion.article>
  );
}
