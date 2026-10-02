import type { AnalysisCapability } from "@/types/data-model";

export function capabilityLabel(cap: AnalysisCapability): string {
  const labels: Record<AnalysisCapability, string> = {
    abc_learning_journey: "Learning Journey (A → B → C)",
    perception_shift: "Perception Shift (A vs B)",
    learning_gain: "Learning Gain (B → C)",
    misconception_analysis: "Misconception Analysis",
    before_after: "Before vs After Comparison",
    direct_change: "Direct Learning / Confidence Change",
    single_form_overview: "Participant Overview",
    response_distribution: "Response Distributions",
    satisfaction: "Satisfaction",
    facilitator: "Facilitator Evaluation",
    teamwork: "Team Collaboration",
    activities: "Activity Effectiveness",
    qualitative_themes: "Qualitative Themes",
    skills_profile: "Skills & Competencies",
    impact_score: "Workshop Impact Score",
  };
  return labels[cap];
}
