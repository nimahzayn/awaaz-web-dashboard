"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ThemeData } from "@/types";

interface ThemeCardProps {
  theme: ThemeData;
  className?: string;
  index?: number;
}

export function ThemeCard({ theme, className, index = 0 }: ThemeCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: theme.color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              {theme.title}
            </h4>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {theme.count} mentions
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {theme.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
