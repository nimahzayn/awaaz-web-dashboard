"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BRAND_COLORS } from "@/constants/colors";
import type { ChartDataPoint } from "@/types";

interface LikertPlaceholderProps {
  data: ChartDataPoint[];
  className?: string;
}

const likertColors = [
  BRAND_COLORS.primary,
  BRAND_COLORS.coral,
  BRAND_COLORS.yellow,
  BRAND_COLORS.lime,
  BRAND_COLORS.green,
];

export function LikertPlaceholder({ data, className }: LikertPlaceholderProps) {
  const maxValue = Math.max(...data.map((d) => d.value as number));

  return (
    <div
      className={cn("space-y-3", className)}
      role="img"
      aria-label="Likert scale distribution placeholder"
    >
      {data.map((item, index) => {
        const value = item.value as number;
        const percentage = (value / maxValue) * 100;

        return (
          <div key={item.name as string} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{item.name}</span>
              <span className="font-medium text-muted-foreground">{value}</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-lg bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="flex h-full items-center justify-end rounded-lg px-2"
                style={{
                  backgroundColor: likertColors[index % likertColors.length],
                }}
              >
                <span className="text-xs font-semibold text-dark">
                  {Math.round((value / data.reduce((s, d) => s + (d.value as number), 0)) * 100)}%
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
