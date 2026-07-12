import { Sparkles } from "lucide-react";

interface AiSummaryCardProps {
  score: number;
  participants: number;
  satisfaction: number;
  learningGain: number;
  insights: string[];
  hasData: boolean;
}

export function AiSummaryCard({
  score,
  participants,
  satisfaction,
  learningGain,
  insights,
  hasData,
}: AiSummaryCardProps) {
  const impactLevel = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";

  const summary = hasData
    ? `This workshop with ${participants} participants achieved a ${impactLevel.toLowerCase()} impact score of ${score}/100. Participants showed an average satisfaction of ${satisfaction}/5 and a learning gain index of ${learningGain}. ${insights[0] || ""} ${insights[1] || ""}`.trim()
    : "Upload your pre and post workshop survey data to see AI-generated insights and impact analysis.";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 p-8 backdrop-blur-md shadow-sm">
      <div className="absolute right-6 top-6 opacity-[0.04]">
        <Sparkles className="h-24 w-24 text-primary" />
      </div>
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            AI Workshop Summary
          </h3>
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </div>
    </div>
  );
}
