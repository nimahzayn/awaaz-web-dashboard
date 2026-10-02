import type { QuestionRef, Stage } from "@/types";
import type { ClassifiedQuestion, QuestionCategory, QuestionType } from "@/types/data-model";
import { extractQuestions, detectIdColumn, isNameColumn } from "./question-matching";

const CATEGORY_PATTERNS: Array<{ category: QuestionCategory; pattern: RegExp }> = [
  { category: "facilitator_evaluation", pattern: /facilitator|instructor|trainer/i },
  { category: "satisfaction", pattern: /overall|satisfaction|satisfied|experience|enjoy|recommend/i },
  { category: "teamwork", pattern: /team|collaborat|group work|ideas?\s+(heard|valued)|respect|perspective/i },
  { category: "activity_effectiveness", pattern: /activit|session|exercise|engag(?:ing|ement)/i },
  { category: "confidence", pattern: /confident|confidence|comfort/i },
  { category: "skills", pattern: /skill|competenc|ability|capable/i },
  { category: "learning", pattern: /learn|understand|knowledge|gain/i },
  { category: "identity", pattern: /caste|gender|religion|identity|diversity/i },
  { category: "citizen_sensitivity", pattern: /citizen|justice|equity|inclusion|social/i },
  { category: "future_intent", pattern: /continue|future|intent|plan|next step/i },
  { category: "engagement", pattern: /engag|interest|motivat|participat/i },
  { category: "open_feedback", pattern: /comment|suggest|feedback|improve|anything else|tell us/i },
  { category: "demographic", pattern: /age|school|grade|city|location|email|name/i },
];

export function detectQuestionType(text: string, sampleValues: unknown[]): QuestionType {
  const numeric = sampleValues.filter((v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))));
  const strings = sampleValues.filter((v) => typeof v === "string" && String(v).trim().length > 0) as string[];

  if (strings.length > 0) {
    const joined = strings.join(" ").toLowerCase();
    if (/(strongly agree|strongly disagree|likert|scale of 1)/i.test(text + joined)) return "likert";
    if (strings.some((s) => s.length > 80)) return "open_ended";
    if (strings.some((s) => /[,;|]/.test(s))) return "multi_select";
    if (/^(yes|no|maybe)$/i.test(strings[0]?.trim() ?? "")) return "yes_no";
  }

  if (numeric.length >= Math.max(1, sampleValues.length * 0.5)) {
    const nums = numeric.map((v) => Number(v));
    const max = Math.max(...nums);
    if (max <= 10) return "rating";
    return "numeric";
  }

  if (strings.length > 0) return "text";
  return "unknown";
}

export function classifyQuestion(text: string, sampleValues: unknown[]): QuestionCategory {
  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  if (detectQuestionType(text, sampleValues) === "open_ended") return "open_feedback";
  return "other";
}

export function buildQuestionCatalog(
  headers: Record<string, string>,
  rows: Record<string, unknown>[],
  stage: Stage,
  idColumn: string
): ClassifiedQuestion[] {
  const refs = extractQuestions(headers, idColumn);
  return refs.map((ref) => {
    const samples = rows.slice(0, 40).map((row) => row[ref.key]).filter((v) => v !== undefined && v !== null && String(v).trim() !== "");
    return {
      key: ref.key,
      text: ref.text,
      stage,
      questionType: detectQuestionType(ref.text, samples),
      category: classifyQuestion(ref.text, samples),
    };
  });
}

export function catalogFromForm(
  headers: Record<string, string>,
  rows: Record<string, unknown>[],
  stage: Stage
): { idColumn: string; questions: ClassifiedQuestion[] } {
  const keys = Object.keys(headers);
  const idColumn = detectIdColumn(keys, rows as Record<string, any>[]);
  if (!idColumn) {
    return { idColumn: "", questions: [] };
  }
  const questions = buildQuestionCatalog(headers, rows, stage, idColumn);
  return { idColumn, questions: questions.filter((q) => !isNameColumn(q.key)) };
}

export function applyQuestionOverrides(
  questions: ClassifiedQuestion[],
  overrides: Array<{ key: string; stage: Stage; questionType?: QuestionType; category?: QuestionCategory }>
): ClassifiedQuestion[] {
  const map = new Map(overrides.map((o) => [`${o.stage}:${o.key}`, o]));
  return questions.map((q) => {
    const o = map.get(`${q.stage}:${q.key}`);
    if (!o) return q;
    return {
      ...q,
      questionType: o.questionType ?? q.questionType,
      category: o.category ?? q.category,
    };
  });
}

export function summarizeQuestionTypes(questions: ClassifiedQuestion[]): Record<QuestionType, number> {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    counts[q.questionType] = (counts[q.questionType] ?? 0) + 1;
  }
  return counts as Record<QuestionType, number>;
}

export function summarizeCategories(questions: ClassifiedQuestion[]): Record<QuestionCategory, number> {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    counts[q.category] = (counts[q.category] ?? 0) + 1;
  }
  return counts as Record<QuestionCategory, number>;
}
