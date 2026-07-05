"use client";

import { motion } from "framer-motion";
import { Star, MessageSquare, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FacilitatorData } from "@/types";

interface FacilitatorCardProps {
  facilitator: FacilitatorData;
  className?: string;
  index?: number;
}

export function FacilitatorCard({
  facilitator,
  className,
  index = 0,
}: FacilitatorCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {facilitator.name}
          </h3>
          <p className="text-sm text-muted-foreground">{facilitator.role}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-yellow/10 px-3 py-1.5">
          <Star className="h-4 w-4 fill-yellow text-yellow" aria-hidden="true" />
          <span className="text-sm font-semibold">{facilitator.rating}</span>
        </div>
      </header>

      <section className="mt-5" aria-label="Comments">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-blue" aria-hidden="true" />
          Comments
        </div>
        <ul className="mt-2 space-y-2">
          {facilitator.comments.map((comment, i) => (
            <li
              key={i}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              {comment}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4" aria-label="Suggestions">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lightbulb className="h-4 w-4 text-purple" aria-hidden="true" />
          Suggestions
        </div>
        <ul className="mt-2 space-y-2">
          {facilitator.suggestions.map((suggestion, i) => (
            <li
              key={i}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </section>
    </motion.article>
  );
}
