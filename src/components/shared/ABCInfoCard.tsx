"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ABCStage } from "@/types";

interface ABCInfoCardProps {
  stages: ABCStage[];
  className?: string;
}

const stageColors = {
  A: "bg-blue/10 text-blue border-blue/20",
  B: "bg-coral/10 text-coral border-coral/20",
  C: "bg-green/10 text-green border-green/20",
};

export function ABCInfoCard({ stages, className }: ABCInfoCardProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
      aria-label="A B C understanding framework explanation"
    >
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">
          Understanding Framework: A → B → C
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold",
                  stageColors[stage.stage]
                )}
              >
                {stage.stage}
              </span>
              {index < stages.length - 1 && (
                <span className="hidden sm:inline text-muted-foreground" aria-hidden="true">
                  →
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              {stage.label}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {stage.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}
