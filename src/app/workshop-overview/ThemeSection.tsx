"use client";

import { ThemeDistribution } from "@/components/charts/ThemeDistribution";
import type { TopicMetric } from "@/types";

interface ThemeSectionProps {
  topics: TopicMetric[];
  challenges: string[];
  strengths: string[];
  hasData: boolean;
}

export function ThemeSection({
  topics,
  challenges,
  strengths,
  hasData,
}: ThemeSectionProps) {
  const themeData = hasData
    ? [
        { label: "Caste", value: Math.round(topics[0]?.c * 20 || 0), color: "#E8126E" },
        { label: "Gender", value: Math.round(topics[1]?.c * 20 || 0), color: "#B07AE6" },
        { label: "Religion", value: Math.round(topics[2]?.c * 20 || 0), color: "#339CFF" },
        ...strengths.slice(0, 3).map((s, i) => ({
          label: s,
          value: Math.round(80 - i * 10),
          color: ["#44E6AD", "#FFBA4C", "#F08367"][i],
        })),
      ]
    : [
        { label: "Caste", value: 0, color: "#E8126E" },
        { label: "Gender", value: 0, color: "#B07AE6" },
        { label: "Religion", value: 0, color: "#339CFF" },
      ];

  const challengeData = hasData
    ? challenges.slice(0, 5).map((c, i) => ({
        label: c,
        value: Math.round(70 - i * 12),
        color: ["#F08367", "#FFBA4C", "#B07AE6", "#E8126E", "#339CFF"][i % 5],
      }))
    : [];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Theme Distribution
        </h3>
        <p className="text-xs text-muted-foreground">
          Key themes and challenges surfaced during the workshop
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Learning Themes
          </p>
          <ThemeDistribution data={themeData} />
        </div>

        {challengeData.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Team Challenges
            </p>
            <ThemeDistribution data={challengeData} />
          </div>
        )}
      </div>
    </div>
  );
}
