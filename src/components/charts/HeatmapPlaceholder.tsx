"use client";

import { motion } from "framer-motion";
import { Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_COLORS } from "@/constants/colors";

interface HeatmapRow {
  topic: string;
  [key: string]: string | number;
}

interface HeatmapPlaceholderProps {
  data: HeatmapRow[];
  columns: string[];
  columnLabels?: Record<string, string>;
  className?: string;
}

function getHeatColor(value: number): string {
  if (value >= 3.5) return BRAND_COLORS.green;
  if (value >= 3.0) return BRAND_COLORS.lime;
  if (value >= 2.5) return BRAND_COLORS.yellow;
  if (value >= 2.0) return BRAND_COLORS.coral;
  return BRAND_COLORS.primary;
}

export function HeatmapPlaceholder({
  data,
  columns,
  columnLabels = {},
  className,
}: HeatmapPlaceholderProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="img"
      aria-label="Learning gain heatmap placeholder"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Grid3x3 className="h-4 w-4" aria-hidden="true" />
        <span>Understanding level by topic and time period</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-100 border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-muted-foreground">
                Topic
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {columnLabels[col] ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.topic}>
                <td className="p-2 text-sm font-medium text-foreground">
                  {row.topic}
                </td>
                {columns.map((col, colIndex) => {
                  const value = row[col] as number;
                  return (
                    <td key={col} className="p-1.5">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: (rowIndex * columns.length + colIndex) * 0.03,
                        }}
                        className="flex h-10 items-center justify-center rounded-lg text-xs font-semibold text-dark"
                        style={{
                          backgroundColor: `${getHeatColor(value)}40`,
                          borderLeft: `3px solid ${getHeatColor(value)}`,
                        }}
                        title={`${row.topic} — ${columnLabels[col] ?? col}: ${value}`}
                      >
                        {value.toFixed(1)}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
