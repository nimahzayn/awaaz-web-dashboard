import { Lightbulb, ArrowRight } from "lucide-react";
import type { TopicMetric } from "@/types";

interface AiRecommendationsProps {
  identityTopics: TopicMetric[];
  activities: Array<{
    name: string;
    rating: number;
    category: string;
    description: string;
  }>;
  facilitator: {
    averageRating: number;
    safeEnvironment: number;
    clearInstructions: number;
    suggestions: string[];
  };
  teamCollaboration: {
    ideasHeard: number;
    respect: number;
    teamPreference: number;
    strengths: string[];
    challenges: string[];
    teamValues: string[];
    visioningExercise: string[];
  };
  hasData: boolean;
}

export function AiRecommendations({
  identityTopics,
  activities,
  facilitator,
  teamCollaboration,
  hasData,
}: AiRecommendationsProps) {
  const recommendations = hasData
    ? [
        {
          title: "Deepen Identity-Based Learning",
          detail: `Consider adding more activities focused on ${identityTopics.sort((a, b) => a.c - b.c)[0]?.topic || "underrepresented topics"} to further strengthen understanding in this area.`,
          type: "growth" as const,
        },
        {
          title: "Build on Activity Strengths",
          detail: `The "${activities.sort((a, b) => b.rating - a.rating)[0]?.name || "top activity"}" activity received the highest rating. Consider using similar formats for future workshops.`,
          type: "strength" as const,
        },
        {
          title: "Address Team Challenges",
          detail: teamCollaboration.challenges[0]
            ? `Teams identified "${teamCollaboration.challenges[0]}" as a challenge. Consider targeted interventions in future sessions.`
            : "Team collaboration is performing well across all dimensions.",
          type: "action" as const,
        },
        {
          title: "Sustain Facilitator Excellence",
          detail: facilitator.suggestions[0]
            ? `Facilitator suggestion: "${facilitator.suggestions[0]}". Consider incorporating into future sessions.`
            : "Maintain the current facilitation approach for consistent outcomes.",
          type: "strength" as const,
        },
      ]
    : [
        {
          title: "Upload Workshop Data",
          detail: "Start by uploading pre-workshop survey data, then post-workshop data to unlock AI-powered recommendations tailored to your workshop.",
          type: "action" as const,
        },
        {
          title: "Configure Your Workshop",
          detail: "Visit Settings to select your workshop, cohort, and configure activity definitions for accurate analysis.",
          type: "action" as const,
        },
      ];

  const typeStyles = {
    growth: { bg: "bg-[#44E6AD]/10", icon: "text-[#44E6AD]" },
    strength: { bg: "bg-[#339CFF]/10", icon: "text-[#339CFF]" },
    action: { bg: "bg-[#FFBA4C]/10", icon: "text-[#FFBA4C]" },
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 p-8 backdrop-blur-md shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            AI Recommendations
          </h3>
          <p className="text-xs text-muted-foreground">
            {hasData
              ? "Personalized suggestions based on your workshop data"
              : "Upload data to receive personalized recommendations"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, i) => {
          const style = typeStyles[rec.type];
          return (
            <div
              key={i}
              className="group flex gap-4 rounded-xl border border-border/30 bg-background/50 p-4 transition-all hover:shadow-sm"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                <ArrowRight className={`h-4 w-4 ${style.icon}`} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {rec.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {rec.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
