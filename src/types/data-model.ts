import type { Stage } from "./index";

export type FormRole = "pre_workshop" | "retrospective_pre" | "post_workshop";

export type QuestionType =
  | "likert"
  | "rating"
  | "yes_no"
  | "multiple_choice"
  | "multi_select"
  | "open_ended"
  | "numeric"
  | "text"
  | "unknown";

export type QuestionCategory =
  | "understanding"
  | "confidence"
  | "learning"
  | "skills"
  | "satisfaction"
  | "engagement"
  | "teamwork"
  | "identity"
  | "citizen_sensitivity"
  | "activity_effectiveness"
  | "facilitator_evaluation"
  | "future_intent"
  | "open_feedback"
  | "demographic"
  | "other";

export type AnalysisMode =
  | "abc"
  | "pre_post"
  | "pre_retro"
  | "retro_post"
  | "single";

export type AnalysisCapability =
  | "abc_learning_journey"
  | "perception_shift"
  | "learning_gain"
  | "misconception_analysis"
  | "before_after"
  | "direct_change"
  | "single_form_overview"
  | "response_distribution"
  | "satisfaction"
  | "facilitator"
  | "teamwork"
  | "activities"
  | "qualitative_themes"
  | "skills_profile"
  | "impact_score";

export interface DataSourceConfig {
  slotIndex: number;
  role: FormRole | null;
  stage: Stage;
  fileName?: string;
  responseCount?: number;
  questionCount?: number;
}

export interface ClassifiedQuestion {
  key: string;
  text: string;
  stage: Stage;
  questionType: QuestionType;
  category: QuestionCategory;
}

export interface QuestionMappingPreview {
  topic: string;
  stages: Partial<Record<Stage, string>>;
  score?: number;
}

export type SelectedFormCount = 1 | 2 | 3;

export interface WorkshopDataConfig {
  /** 0 = user has not chosen how many forms yet */
  formCount: 0 | SelectedFormCount;
  sources: DataSourceConfig[];
  questions: ClassifiedQuestion[];
  idColumnByStage: Partial<Record<Stage, string>>;
  warnings: string[];
  analysisMode: AnalysisMode;
  capabilities: AnalysisCapability[];
  questionMappings: QuestionMappingPreview[];
  confirmedAt?: string | null;
}

export const FORM_ROLE_LABELS: Record<FormRole, string> = {
  pre_workshop: "Pre-workshop",
  retrospective_pre: "Retrospective Pre",
  post_workshop: "Post-workshop",
};

export const FORM_ROLE_DESCRIPTIONS: Record<FormRole, string> = {
  pre_workshop: "Original understanding before the workshop (A)",
  retrospective_pre: "Revised view of pre-workshop understanding (B)",
  post_workshop: "Current understanding after the workshop (C)",
};

export function roleToStage(role: FormRole): Stage {
  if (role === "pre_workshop") return "a";
  if (role === "retrospective_pre") return "b";
  return "c";
}

const SLOT_STAGES: Stage[] = ["a", "b", "c"];
const DEFAULT_ROLES: FormRole[] = ["pre_workshop", "retrospective_pre", "post_workshop"];

/** Build upload slot list when the user picks 1, 2, or 3 forms (client + server). */
export function sourcesForFormCount(
  formCount: SelectedFormCount,
  existing: DataSourceConfig[] = []
): DataSourceConfig[] {
  const sources: DataSourceConfig[] = [];
  for (let i = 0; i < formCount; i++) {
    const prev = existing.find((s) => s.slotIndex === i);
    const role: FormRole | null = prev?.role ?? (formCount === 3 ? DEFAULT_ROLES[i] : null);
    sources.push({
      slotIndex: i,
      role,
      stage: role ? roleToStage(role) : SLOT_STAGES[i],
      fileName: prev?.fileName,
      responseCount: prev?.responseCount,
      questionCount: prev?.questionCount,
    });
  }
  return sources;
}

/** New workshops start with no form count chosen and no upload slots. */
export const EMPTY_DATA_CONFIG: WorkshopDataConfig = {
  formCount: 0,
  sources: [],
  questions: [],
  idColumnByStage: {},
  warnings: [],
  analysisMode: "single",
  capabilities: [],
  questionMappings: [],
  confirmedAt: null,
};

/** Legacy / settings ABC path when all three stages are implied. */
export const DEFAULT_DATA_CONFIG: WorkshopDataConfig = {
  formCount: 3,
  sources: [
    { slotIndex: 0, role: "pre_workshop", stage: "a" },
    { slotIndex: 1, role: "retrospective_pre", stage: "b" },
    { slotIndex: 2, role: "post_workshop", stage: "c" },
  ],
  questions: [],
  idColumnByStage: {},
  warnings: [],
  analysisMode: "abc",
  capabilities: [],
  questionMappings: [],
  confirmedAt: null,
};

export function isLegacyDefaultThreeFormConfig(config: WorkshopDataConfig): boolean {
  if (config.formCount !== 3 || config.sources.length !== 3) return false;
  const hasProgress =
    config.sources.some((s) => s.fileName) ||
    config.questions.length > 0 ||
    !!config.confirmedAt;
  if (hasProgress) return false;
  return (
    config.sources[0]?.role === "pre_workshop" &&
    config.sources[1]?.role === "retrospective_pre" &&
    config.sources[2]?.role === "post_workshop"
  );
}

export function initialSelectedFormCount(config: WorkshopDataConfig): SelectedFormCount | null {
  if (config.formCount === 0 || config.sources.length === 0) return null;
  if (isLegacyDefaultThreeFormConfig(config)) return null;
  if (config.formCount === 1 || config.formCount === 2 || config.formCount === 3) {
    return config.formCount;
  }
  return null;
}
