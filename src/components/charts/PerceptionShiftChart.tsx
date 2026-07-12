"use client";

interface PerceptionData {
  topic: string;
  before: number;
  retrospective: number;
  after: number;
}

interface PerceptionShiftChartProps {
  data: PerceptionData[];
}

export function PerceptionShiftChart({ data }: PerceptionShiftChartProps) {
  const max = Math.max(...data.map((d) => Math.max(d.before, d.retrospective, d.after)), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const misconceptionGap = item.retrospective - item.before;
        const learningGain = item.after - item.retrospective;

        return (
          <div key={item.topic} className="space-y-2">
            <p className="text-sm font-medium text-foreground">{item.topic}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 text-[10px] text-muted-foreground">A</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full bg-muted transition-all duration-700"
                    style={{ width: `${(item.before / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] font-medium text-muted-foreground">
                  {item.before.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-[10px] text-muted-foreground">B</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(item.retrospective / max) * 100}%`,
                      backgroundColor: "#F08367",
                    }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] font-medium text-[#F08367]">
                  {item.retrospective.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-[10px] text-muted-foreground">C</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(item.after / max) * 100}%`,
                      backgroundColor: "#E8126E",
                    }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] font-medium text-[#E8126E]">
                  {item.after.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-[10px]">
              {misconceptionGap > 0 && (
                <span className="text-[#F08367]">
                  +{misconceptionGap.toFixed(1)} misconception gap
                </span>
              )}
              {learningGain > 0 && (
                <span className="text-[#E8126E]">
                  +{learningGain.toFixed(1)} learning gain
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
