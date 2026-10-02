import type { Stage } from "@/types";
import type { AnalysisCapability, AnalysisMode, FormRole, WorkshopDataConfig } from "@/types/data-model";
import { roleToStage } from "@/types/data-model";

/** Infer analysis mode from which of Form A / B / C are actually present. */
export function deriveAnalysisModeFromStages(stages: Stage[]): AnalysisMode {
  const unique = [...new Set(stages)];
  if (unique.length <= 1) return "single";
  const set = new Set(unique);
  if (set.has("a") && set.has("b") && set.has("c")) return "abc";
  if (set.has("a") && set.has("c") && unique.length === 2) return "pre_post";
  if (set.has("a") && set.has("b") && unique.length === 2) return "pre_retro";
  if (set.has("b") && set.has("c") && unique.length === 2) return "retro_post";
  return "single";
}

export function deriveAnalysisMode(roles: FormRole[]): AnalysisMode {
  const stages = new Set(roles.map(roleToStage));
  if (roles.length === 1) return "single";
  if (stages.has("a") && stages.has("b") && stages.has("c")) return "abc";
  if (stages.has("a") && stages.has("c")) return "pre_post";
  if (stages.has("a") && stages.has("b")) return "pre_retro";
  if (stages.has("b") && stages.has("c")) return "retro_post";
  return "single";
}

export function deriveCapabilities(
  mode: AnalysisMode,
  presentStages: Stage[],
  hasMatchedParticipants: boolean
): AnalysisCapability[] {
  const caps = new Set<AnalysisCapability>();

  caps.add("single_form_overview");
  caps.add("response_distribution");
  caps.add("qualitative_themes");
  caps.add("satisfaction");
  caps.add("facilitator");
  caps.add("teamwork");
  caps.add("activities");
  caps.add("skills_profile");

  if (!hasMatchedParticipants && presentStages.length > 1) {
    return [...caps];
  }

  switch (mode) {
    case "abc":
      caps.add("abc_learning_journey");
      caps.add("perception_shift");
      caps.add("learning_gain");
      caps.add("misconception_analysis");
      caps.add("impact_score");
      break;
    case "pre_post":
      caps.add("before_after");
      caps.add("direct_change");
      if (presentStages.includes("c")) caps.add("impact_score");
      break;
    case "pre_retro":
      caps.add("perception_shift");
      caps.add("misconception_analysis");
      break;
    case "retro_post":
      caps.add("learning_gain");
      caps.add("before_after");
      break;
    case "single":
      break;
  }

  return [...caps];
}

export function rebuildConfigFromSources(
  formCount: 1 | 2 | 3,
  sources: WorkshopDataConfig["sources"]
): Pick<WorkshopDataConfig, "analysisMode" | "capabilities"> {
  const roles = sources.filter((s) => s.role).map((s) => s.role!) as FormRole[];
  const mode = formCount === 1 ? "single" : deriveAnalysisMode(roles);
  const presentStages = sources.map((s) => s.stage);
  const capabilities = deriveCapabilities(mode, presentStages, true);
  return { analysisMode: mode, capabilities };
}

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

export function unavailableAnalyses(mode: AnalysisMode): string[] {
  const messages: string[] = [];
  if (mode !== "abc") {
    messages.push("Full A → B → C learning journey requires Pre, Retrospective Pre, and Post forms.");
  }
  if (mode === "pre_retro") {
    messages.push("Post-workshop learning gain is unavailable because no Post-workshop form was uploaded.");
  }
  if (mode === "single") {
    messages.push("Cross-form before/after comparisons require at least two forms with matching participant IDs.");
  }
  return messages;
}
