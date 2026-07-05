"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function AnalysisCard({
  title,
  description,
  children,
  className,
  index = 0,
}: AnalysisCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
      aria-labelledby={`analysis-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <header className="mb-4">
        <h3
          id={`analysis-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-base font-semibold text-foreground"
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </motion.section>
  );
}
