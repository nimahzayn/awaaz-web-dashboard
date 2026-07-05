"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  index?: number;
}

export function ChartCard({
  title,
  description,
  children,
  className,
  action,
  index = 0,
}: ChartCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
      aria-labelledby={`chart-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3
            id={`chart-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className="text-base font-semibold text-foreground"
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
      <div className="w-full">{children}</div>
    </motion.section>
  );
}
