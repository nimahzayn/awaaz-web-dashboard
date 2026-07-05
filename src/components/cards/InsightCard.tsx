"use client";

import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightData } from "@/types";

interface InsightCardProps {
  insight: InsightData;
  index?: number;
  className?: string;
}

const typeConfig = {
  positive: {
    icon: Lightbulb,
    accent: "border-l-green bg-green/5",
    iconColor: "text-green",
  },
  attention: {
    icon: AlertTriangle,
    accent: "border-l-coral bg-coral/5",
    iconColor: "text-coral",
  },
  neutral: {
    icon: Info,
    accent: "border-l-blue bg-blue/5",
    iconColor: "text-blue",
  },
};

export function InsightCard({ insight, index = 0, className }: InsightCardProps) {
  const config = typeConfig[insight.type ?? "neutral"];
  const Icon = config.icon;

  return (
    <motion.article
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn(
        "rounded-xl border border-border border-l-4 bg-surface p-4 shadow-sm",
        config.accent,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon
          className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)}
          aria-hidden="true"
        />
        <div className="space-y-1.5">
          {insight.tag && (
            <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {insight.tag}
            </span>
          )}
          <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
