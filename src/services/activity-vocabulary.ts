import type { QuestionRef } from "@/types";
import {
  humanMeasureLabel,
  isAnalysisQuestion,
  isFacilitatorEvaluationQuestion,
  isPlausibleRatingValues,
  looksLikePersonNameHeader,
} from "./measure-labels";

/** Known activity families — used to match open text and unify sheet labels (sheet label wins when present). */
export const ACTIVITY_ALIAS_GROUPS: Array<{
  mergeKey: string;
  defaultDisplay: string;
  patterns: RegExp[];
}> = [
  {
    mergeKey: "clay",
    defaultDisplay: "Clay-based Activity",
    patterns: [/\bclay[\s-]*based\b/i, /\bclay[\s-]*mascot\b/i, /\bclay\b/i],
  },
  {
    mergeKey: "6w2h",
    defaultDisplay: "Problem solving (6W+2H)",
    patterns: [/\b6\s*w\s*\+?\s*2\s*h\b/i, /\b6w2h\b/i, /\bproblem[\s-]*solv/i],
  },
  {
    mergeKey: "river",
    defaultDisplay: "Drawing-based (River of Life)",
    patterns: [/\briver\s+of\s+life\b/i, /\briver[\s-]*(of[\s-]*)?life\b/i, /\briver[\s-]*drawing\b/i],
  },
  {
    mergeKey: "ai",
    defaultDisplay: "AI-based",
    patterns: [/\bai[\s-]*based\b/i, /\bai\b/i],
  },
  {
    mergeKey: "bingo",
    defaultDisplay: "Game-based (Bingo/cheers to constitution)",
    patterns: [/\bbingo\b/i, /cheers\s+to\s+constitution/i, /\bbingo\s+game\b/i],
  },
  {
    mergeKey: "laptop",
    defaultDisplay: "Laptop-based",
    patterns: [/\blaptop[\s-]*based\b/i, /\blaptop\b/i],
  },
  {
    mergeKey: "field",
    defaultDisplay: "Field activity",
    patterns: [/\bfield[\s-]*activit/i],
  },
  {
    mergeKey: "feelings",
    defaultDisplay: "Feelings chart",
    patterns: [/\bfeelings[\s-]*chart\b/i],
  },
  {
    mergeKey: "casestudy",
    defaultDisplay: "Case Study Reading",
    patterns: [/\bcase[\s-]*study\b/i],
  },
  {
    mergeKey: "intervention",
    defaultDisplay: "Intervention Planning",
    patterns: [/\bintervention[\s-]*planning\b/i],
  },
  {
    mergeKey: "visioning",
    defaultDisplay: "Visioning Exercise",
    patterns: [/\bvisioning\b/i],
  },
];

export function activityMergeKey(label: string): string {
  const alias = mergeKeyFromAliasPatterns(label);
  if (alias) return alias;
  return label
    .toLowerCase()
    .replace(/[^a-z0-9+]/g, "")
    .slice(0, 48);
}

export function mergeKeyFromAliasPatterns(text: string): string | null {
  for (const g of ACTIVITY_ALIAS_GROUPS) {
    if (g.patterns.some((p) => p.test(text))) return g.mergeKey;
  }
  return null;
}

/** Google Forms matrix exports: long question text + activity name in [brackets]. */
const TRUNCATED_BRACKET_PREFIX: Array<{ test: RegExp; mergeKey: string }> = [
  { test: /^clay/i, mergeKey: "clay" },
  { test: /^drawin/i, mergeKey: "river" },
  { test: /^proble/i, mergeKey: "6w2h" },
  { test: /^game/i, mergeKey: "bingo" },
  { test: /^ai\s*bas/i, mergeKey: "ai" },
  { test: /^laptop/i, mergeKey: "laptop" },
  { test: /^field/i, mergeKey: "field" },
  { test: /^feelin/i, mergeKey: "feelings" },
  { test: /^case\s*s/i, mergeKey: "casestudy" },
  { test: /^interv/i, mergeKey: "intervention" },
];

function mergeKeyFromTruncatedBracket(fragment: string): string | null {
  const t = fragment.trim();
  for (const { test, mergeKey } of TRUNCATED_BRACKET_PREFIX) {
    if (test.test(t)) return mergeKey;
  }
  return null;
}

function canonicalDisplayForMergeKey(mergeKey: string): string | null {
  return ACTIVITY_ALIAS_GROUPS.find((g) => g.mergeKey === mergeKey)?.defaultDisplay ?? null;
}

function resolveActivityEntityFromFragment(fragment: string): string | null {
  const t = fragment.trim();
  if (!t || t.length < 2) return null;
  if (looksLikePersonNameHeader(t)) return null;
  if (/^(the|a|an)\s+activit(y|ies)$/i.test(t)) return null;
  if (/\b(caste|gender|religion)\b/i.test(t) && !/\b(case[\s-]*study|river)\b/i.test(t)) return null;

  const aliasKey = mergeKeyFromAliasPatterns(t) ?? mergeKeyFromTruncatedBracket(t);
  if (aliasKey) return canonicalDisplayForMergeKey(aliasKey);

  const cleaned = stripActivityRatingBoilerplate(t);
  if (cleaned && isTitleLikeStructuredActivityLabel(cleaned)) return cleaned;
  return null;
}

/** Parse activity entity from matrix/grid column headers like "... [Clay based Activity]". */
export function extractGridActivityFromHeader(rawLabel: string): string | null {
  const text = String(rawLabel ?? "");
  const brackets = [...text.matchAll(/\[\s*([^\]]{2,80})\s*\]/g)];
  for (let i = brackets.length - 1; i >= 0; i--) {
    const inner = brackets[i][1].trim();
    if (/^\d/.test(inner)) continue;
    if (/most effective|least effective|being most|being least/i.test(inner)) continue;
    const name = resolveActivityEntityFromFragment(inner);
    if (name) return name;
  }
  return null;
}

const RATING_HEADER_BOILERPLATE =
  /^(?:\d+[.)]\s*)?(?:how|please|on a scale|rate|rating|how useful|how much|how enjoyable|how effective|to what extent)[^.?!]*?(?:\s*[-–—:]\s*)?/i;

/** Strip survey wording so column titles become activity entities. */
export function stripActivityRatingBoilerplate(text: string): string {
  let t = String(text ?? "").trim();
  t = t.replace(RATING_HEADER_BOILERPLATE, "").trim();
  t = t.replace(/\s*\(?\s*(?:1\s*[-–]\s*5|1\s*to\s*5|1\s*-\s*10)\s*\)?\s*$/i, "").trim();
  t = t.replace(/\?+$/, "").trim();
  return t;
}

export function isSentenceLikeActivityNoise(text: string): boolean {
  const t = String(text ?? "").trim();
  if (!t || t.length > 100) return true;
  if (/\?/.test(t) && t.length > 35) return true;
  if (/\b(helped me|helped us|understand|teamwork|facilitator|workshop helped|learned about|very supportive|because it was)\b/i.test(t)) {
    return true;
  }
  if (/^(the|i|we|my)\s+/i.test(t) && t.split(/\s+/).length >= 9) return true;
  return false;
}

export function isGenericActivityReferenceOnly(text: string): boolean {
  const t = String(text ?? "").trim();
  if (!t) return true;

  const hasSpecific = ACTIVITY_ALIAS_GROUPS.some((g) => g.patterns.some((p) => p.test(t)));
  if (hasSpecific) return false;

  if (/^(the\s+)?activit(y|ies)\s+(was|were|is|are|helped|help|very|really|so|quite|most|more|engaging|useful|fun|interesting|good|great|amazing|nice)/i.test(t)) {
    return true;
  }
  if (/^(i\s+)?(liked|enjoyed|loved|preferred)\s+(the\s+)?activit(y|ies)\b/i.test(t)) return true;
  if (/^activit(y|ies)\s+(was|were)\b/i.test(t)) return true;
  if (/\bduring the activit(y|ies)\b/i.test(t) && !hasSpecific) return true;
  if (/\b(gauri|rohit|anjali)'s activit/i.test(t)) return true;

  const stripped = t
    .replace(/\b(the|a|an)\s+activit(y|ies)\b/gi, " ")
    .replace(/\bactivit(y|ies)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length < 4 && /\bactivit/i.test(t)) return true;

  return false;
}

export function isTitleLikeStructuredActivityLabel(label: string): boolean {
  const t = stripActivityRatingBoilerplate(label);
  if (!t || t.length < 3 || t.length > 80) return false;
  if (isSentenceLikeActivityNoise(t)) return false;
  if (looksLikePersonNameHeader(t)) return false;
  if (/^(the|a|an)\s+activit(y|ies)$/i.test(t)) return false;

  if (mergeKeyFromAliasPatterns(t)) return true;

  if (/\b(year of study|grade level|school name|demographic)\b/i.test(t)) return false;
  if (/\bstudy\b/i.test(t) && !/\bcase[\s-]*study\b/i.test(t)) return false;

  const activityNoun =
    /\b(activity|exercise|session|game|chart|planning|drawing|mascot|bingo|visioning|clay|laptop|field)\b/i;
  if (activityNoun.test(t) && t.split(/\s+/).length <= 8) return true;

  return false;
}

export function resolveStructuredActivityDisplayName(rawLabel: string): string | null {
  const fromGrid = extractGridActivityFromHeader(rawLabel);
  if (fromGrid) return fromGrid;

  const cleaned = stripActivityRatingBoilerplate(rawLabel);
  if (!cleaned || cleaned.includes("…") || cleaned.length > 72) return null;
  if (isSentenceLikeActivityNoise(cleaned)) return null;
  if (looksLikePersonNameHeader(cleaned)) return null;
  if (/^(the|a|an)\s+activit(y|ies)$/i.test(cleaned)) return null;

  const aliasKey = mergeKeyFromAliasPatterns(cleaned);
  if (aliasKey) {
    const def = ACTIVITY_ALIAS_GROUPS.find((g) => g.mergeKey === aliasKey);
    if (def && cleaned.length <= def.defaultDisplay.length + 15) {
      return cleaned.length >= 6 ? cleaned : def.defaultDisplay;
    }
    return def?.defaultDisplay ?? cleaned;
  }

  if (isTitleLikeStructuredActivityLabel(cleaned)) return cleaned;
  return null;
}

export interface ActivityVocabEntry {
  mergeKey: string;
  displayName: string;
  patterns: RegExp[];
}

export function buildVocabEntry(displayName: string): ActivityVocabEntry {
  const mergeKey = activityMergeKey(displayName);
  const patterns: RegExp[] = [];
  const group = ACTIVITY_ALIAS_GROUPS.find((g) => g.mergeKey === mergeKey);
  if (group) patterns.push(...group.patterns);

  const tokens = displayName
    .split(/[\s/()+,-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !/^(activity|based|game|chart|reading|planning)$/i.test(w));
  for (const tok of tokens) {
    patterns.push(new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
  }

  return { mergeKey, displayName, patterns };
}

/** Map open-ended text to canonical activities already discovered from structured ratings. */
export function matchOpenTextToVocabulary(text: string, vocab: ActivityVocabEntry[]): string[] {
  const t = String(text ?? "").trim();
  if (t.length < 4 || isGenericActivityReferenceOnly(t)) return [];

  const matched = new Set<string>();
  for (const entry of vocab) {
    if (entry.patterns.some((p) => p.test(t))) {
      matched.add(entry.displayName);
    }
  }
  return [...matched];
}

export interface StructuredActivityColumn {
  stage: "a" | "b" | "c";
  ref: QuestionRef;
  displayName: string;
  mergeKey: string;
  values: number[];
}

export function findStructuredActivityRatingColumns(
  unmatched: Array<{ stage: "a" | "b" | "c"; ref: QuestionRef; values: number[] }>,
  presentStages: Array<"a" | "b" | "c">
): StructuredActivityColumn[] {
  const out: StructuredActivityColumn[] = [];

  for (const u of unmatched) {
    if (!presentStages.includes(u.stage)) continue;
    if (!isAnalysisQuestion(u.ref)) continue;
    if (!isPlausibleRatingValues(u.values)) continue;
    if (isFacilitatorEvaluationQuestion(u.ref)) continue;

    const headerText = String(u.ref.text ?? "").trim() || humanMeasureLabel(u.ref) || u.ref.key;
    const displayName = resolveStructuredActivityDisplayName(headerText);
    if (!displayName) continue;

    out.push({
      stage: u.stage,
      ref: u.ref,
      displayName,
      mergeKey: activityMergeKey(displayName),
      values: u.values,
    });
  }

  return out;
}
