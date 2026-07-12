"use client";

import { Sparkline } from "@/components/charts/Sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { TopicMetric } from "@/types";

interface CompetencyGrowthSectionProps {
  identityGrowth: number;
  problemSolvingGrowth: number;
  teamCollaboration: {
    ideasHeard: number;
    respect: number;
    teamPreference: number;
    strengths: string[];
    challenges: string[];
    teamValues: string[];
    visioningExercise: string[];
  };
  skills: Array<{ name: string; value: number }>;
  hasData: boolean;
}

export function CompetencyGrowthSection({
  identityGrowth,
  problemSolvingGrowth,
  teamCollaboration,
  skills,
  hasData,
}: CompetencyGrowthSectionProps) {
  const teamGrowth = hasData ? Math.round((teamCollaboration.ideasHeard + teamCollaboration.respect + teamCollaboration.teamPreference) / 3) : 0;
  const competencies = hasData
    ? [
        { name: "Identity Awareness", growth: identityGrowth, sparkData: [identityGrowth * 0.6, identityGrowth * 0.8, identityGrowth] },
        { name: "Problem Solving", growth: problemSolvingGrowth, sparkData: [problemSolvingGrowth * 0.5, problemSolvingGrowth * 0.7, problemSolvingGrowth] },
        { name: "Team Collaboration", growth: teamGrowth, sparkData: [teamGrowth * 0.4, teamGrowth * 0.75, teamGrowth] },
        ...skills.slice(0, 2).map((s) => ({
          name: s.name,
          growth: Math.round(s.value * 0.3),
          sparkData: [s.value * 0.5, s.value * 0.7, s.value],
        })),
      ]
    : [
        { name: "Identity Awareness", growth: 0, sparkData: [0, 0, 0] },
        { name: "Problem Solving", growth: 0, sparkData: [0, 0, 0] },
        { name: "Team Collaboration", growth: 0, sparkData: [0, 0, 0] },
      ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Competency Growth
        </h3>
        <p className="text-xs text-muted-foreground">
          Pre-to-post improvement across core competencies
        </p>
      </div>

      <div className="space-y-4">
        {competencies.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-4 rounded-xl border border-border/30 bg-background/50 p-4"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  {hasData ? `+${c.growth}` : "—"}
                </span>
                {hasData && (
                  <span className="text-xs text-muted-foreground">points</span>
                )}
              </div>
            </div>
            <div className="w-24">
              <Sparkline
                data={c.sparkData}
                color={c.growth > 0 ? "#44E6AD" : "#F08367"}
                height={32}
              />
            </div>
            {hasData && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#44E6AD]/10">
                {c.growth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-[#44E6AD]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-[#F08367]" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
