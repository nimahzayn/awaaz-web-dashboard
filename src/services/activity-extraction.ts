import type { ParticipantRecord, QuestionRef, Stage } from "@/types";
import type { AnalyticsSnapshot } from "@/types";
import { isAnalysisQuestion, isPlausibleRatingValues } from "./measure-labels";
import {
  buildVocabEntry,
  findStructuredActivityRatingColumns,
  type ActivityVocabEntry,
} from "./activity-vocabulary";
import { classifyOpenTextActivities } from "./gemini-activity-classifier";
import { isRelevantOpenTextForActivityAnalysis } from "./activity-open-text";

type ActivityRow = AnalyticsSnapshot["activities"][number];

interface NumericQuestionColumn {
  stage: Stage;
  ref: QuestionRef;
  values: number[];
}

function collectAllNumericQuestionColumns(
  allQuestions: Array<{ stage: Stage; ref: QuestionRef }>,
  responses: ParticipantRecord[],
  presentStages: Stage[]
): NumericQuestionColumn[] {
  const out: NumericQuestionColumn[] = [];
  for (const q of allQuestions) {
    if (!presentStages.includes(q.stage)) continue;
    if (!isAnalysisQuestion(q.ref)) continue;
    const values = responses
      .map((r) => r.answers[q.stage]?.[q.ref.key])
      .filter((v): v is number => typeof v === "number");
    if (values.length === 0 || !isPlausibleRatingValues(values)) continue;
    out.push({ stage: q.stage, ref: q.ref, values });
  }
  return out;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(1));
}

function positiveRatingPct(values: number[]): number {
  if (!values.length) return 0;
  const hi = values.filter((v) => v >= 4).length;
  return Math.round((hi / values.length) * 100);
}

interface ActivityAccumulator {
  displayName: string;
  ratingValues: number[];
  mentionEvidence: string[];
  mentionCount: number;
}

/**
 * Activity analysis pipeline:
 * 1) Canonical list + 1–5 ratings from structured per-activity columns in the upload (full header text).
 * 2) Open-ended: Gemini (or alias-only fallback) maps comments to canonical names — never stores sentences as activities.
 */
export async function extractWorkshopActivities(args: {
  responses: ParticipantRecord[];
  presentStages: Stage[];
  unmatchedNumeric?: NumericQuestionColumn[];
  openTextByStage: Record<string, Array<{ text: string; values: string[] }>>;
  allQuestions: Array<{ stage: Stage; ref: QuestionRef }>;
}): Promise<ActivityRow[]> {
  const { presentStages, openTextByStage } = args;
  if (!presentStages.length) return [];

  const numericPool = collectAllNumericQuestionColumns(
    args.allQuestions,
    args.responses,
    presentStages
  );
  const structured = findStructuredActivityRatingColumns(numericPool, presentStages);
  if (structured.length === 0) return [];

  const byKey = new Map<string, ActivityAccumulator>();

  for (const col of structured) {
    let acc = byKey.get(col.mergeKey);
    if (!acc) {
      acc = {
        displayName: col.displayName,
        ratingValues: [],
        mentionEvidence: [],
        mentionCount: 0,
      };
      byKey.set(col.mergeKey, acc);
    } else if (col.displayName.length > acc.displayName.length) {
      acc.displayName = col.displayName;
    }
    acc.ratingValues.push(...col.values);
  }

  const canonicalActivities = [...byKey.values()]
    .map((a) => a.displayName)
    .sort((a, b) => a.localeCompare(b));

  const vocab: ActivityVocabEntry[] = canonicalActivities.map((d) => buildVocabEntry(d));

  const openTexts: string[] = [];
  for (const stage of presentStages) {
    for (const block of openTextByStage[stage] ?? []) {
      if (!isRelevantOpenTextForActivityAnalysis(block.text)) continue;
      for (const v of block.values) {
        if (typeof v === "string" && v.trim().length >= 4) openTexts.push(v.trim());
      }
    }
  }

  let classification = new Map<string, string[]>();
  try {
    classification = await classifyOpenTextActivities({
      texts: openTexts,
      canonicalActivities,
      vocab,
    });
  } catch (err) {
    console.error("[activity-analysis] Open-text classification failed (ratings unchanged):", err);
  }

  for (const [text, names] of classification) {
    for (const name of names) {
      const key = [...byKey.entries()].find(([, v]) => v.displayName === name)?.[0];
      if (!key) continue;
      const acc = byKey.get(key)!;
      acc.mentionCount += 1;
      if (acc.mentionEvidence.length < 3 && text.length >= 10) {
        acc.mentionEvidence.push(text.slice(0, 160));
      }
    }
  }

  const activities: ActivityRow[] = [];

  for (const acc of byKey.values()) {
    const validRatings = acc.ratingValues.filter((v) => v > 0 && v <= 10);
    if (validRatings.length === 0) continue;

    const rating = average(validRatings);
    const posPct = positiveRatingPct(validRatings);
    const mentionNote =
      acc.mentionCount > 0 ? ` · ${acc.mentionCount} supporting mention(s)` : "";

    activities.push({
      name: acc.displayName,
      rating,
      category: `${validRatings.length} responses · ${posPct}% rated 4–5${mentionNote}`,
      description:
        acc.mentionEvidence[0] ??
        `Average ${rating}/5 from ${validRatings.length} structured rating(s).`,
    });
  }

  return activities.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
}
