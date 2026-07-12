"use client";

import { SentimentBar } from "@/components/charts/SentimentBar";
import { Sparkline } from "@/components/charts/Sparkline";

interface SentimentSectionProps {
  overallSatisfaction: number;
  facilitatorRating: number;
  citizenSensitivity: { before: number; after: number; change: number };
  hasData: boolean;
}

export function SentimentSection({
  overallSatisfaction,
  facilitatorRating,
  citizenSensitivity,
  hasData,
}: SentimentSectionProps) {
  const satisfactionData = hasData
    ? [
        { label: "Very Satisfied", value: Math.round(overallSatisfaction * 18), color: "#44E6AD" },
        { label: "Satisfied", value: Math.round(overallSatisfaction * 22), color: "#339CFF" },
        { label: "Neutral", value: Math.round((5 - overallSatisfaction) * 10), color: "#FFBA4C" },
        { label: "Unsatisfied", value: Math.round((5 - overallSatisfaction) * 3), color: "#F08367" },
      ]
    : [
        { label: "Very Satisfied", value: 0, color: "#44E6AD" },
        { label: "Satisfied", value: 0, color: "#339CFF" },
        { label: "Neutral", value: 0, color: "#FFBA4C" },
        { label: "Unsatisfied", value: 0, color: "#F08367" },
      ];

  const sensitivityBefore = hasData ? [citizenSensitivity.before * 0.7, citizenSensitivity.before * 0.85, citizenSensitivity.before] : [0, 0, 0];
  const sensitivityAfter = hasData ? [citizenSensitivity.after * 0.6, citizenSensitivity.after * 0.8, citizenSensitivity.after] : [0, 0, 0];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm">
      <div className="mb-6 space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Participant Sentiment
        </h3>
        <p className="text-xs text-muted-foreground">
          Overall satisfaction and sensitivity awareness shifts
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Overall Satisfaction
          </p>
          <SentimentBar data={satisfactionData} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Facilitator Rating
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {hasData ? facilitatorRating : "—"}
              </span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <div className="mt-2">
              <Sparkline
                data={hasData ? [facilitatorRating, facilitatorRating * 0.95, facilitatorRating * 1.02, facilitatorRating] : [0, 0, 0, 0]}
                color="#E8126E"
                height={32}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Citizen Sensitivity Shift
            </p>
            <div className="space-y-2">
              {["Before", "After"].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-14 text-xs text-muted-foreground">{label}</span>
                  <div className="flex-1">
                    <Sparkline
                      data={i === 0 ? sensitivityBefore : sensitivityAfter}
                      color={i === 0 ? "#F08367" : "#44E6AD"}
                      height={24}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
