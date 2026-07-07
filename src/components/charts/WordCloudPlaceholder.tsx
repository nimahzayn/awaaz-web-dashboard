"use client";

import { motion } from "framer-motion";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_COLORS } from "@/constants/colors";

interface WordItem {
  text: string;
  size: number;
}

interface WordCloudPlaceholderProps {
  words: WordItem[];
  className?: string;
}

const wordColors = [
  BRAND_COLORS.primary,
  BRAND_COLORS.purple,
  BRAND_COLORS.blue,
  BRAND_COLORS.coral,
  BRAND_COLORS.green,
  BRAND_COLORS.yellow,
  BRAND_COLORS.lime,
  BRAND_COLORS.dark,
];

export function WordCloudPlaceholder({
  words,
  className,
}: WordCloudPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[240px] flex-wrap items-center justify-center gap-3 rounded-xl bg-muted/50 p-8",
        className,
      )}
      role="img"
      aria-label="Word cloud visualization placeholder"
    >
      <Cloud
        className="absolute right-4 top-4 h-5 w-5 text-muted-foreground/40"
        aria-hidden="true"
      />
      {words.map((word, index) => (
        <motion.span
          key={word.text}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
          className="cursor-default font-semibold transition-transform hover:scale-110"
          style={{
            fontSize: `${word.size * 0.45 + 10}px`,
            color: wordColors[index % wordColors.length],
          }}
        >
          {word.text}
        </motion.span>
      ))}
    </div>
  );
}
