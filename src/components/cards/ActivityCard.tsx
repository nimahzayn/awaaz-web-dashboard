"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityData } from "@/types";

interface ActivityCardProps {
  activity: ActivityData;
  variant?: "top" | "bottom";
  className?: string;
  index?: number;
}

export function ActivityCard({
  activity,
  variant = "top",
  className,
  index = 0,
}: ActivityCardProps) {
  const Icon = variant === "top" ? Trophy : TrendingDown;
  const accentColor = variant === "top" ? "text-yellow" : "text-coral";

  return (
    <motion.article
      initial={{ opacity: 0, x: variant === "top" ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn(
        "flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted",
          accentColor
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{activity.rank}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {activity.category}
          </span>
        </div>
        <h4 className="mt-1 text-sm font-semibold text-foreground">
          {activity.name}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {activity.description}
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {activity.rating} / 5
        </p>
      </div>
    </motion.article>
  );
}
