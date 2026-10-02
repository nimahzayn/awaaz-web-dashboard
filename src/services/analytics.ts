import type {
  AnalyticsSnapshot,
  DimensionMatch,
  InsightData,
  ParticipantRecord,
  QuestionRef,
  Stage,
  TopicMetric,
} from "@/types";
import { deriveAnalysisModeFromStages, deriveCapabilities } from "./analysis-capabilities";
import { getAnalyticsSource } from "./analytics-source";
import { extractWorkshopActivities } from "./activity-extraction";
import {
  humanMeasureLabel,
  isAnalysisQuestion,
  isPlausibleRatingValues,
  isPlausibleTopicAverages,
  resolveDimensionDisplayName,
} from "./measure-labels";
import {
  buildOverviewEducatorInsights,
  computeOverviewImpactScore,
} from "./overview-educator-insights";
import { getWorkshopDataConfig } from "./workshops";

function average(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function round(value: number): number {
  return Number(value.toFixed(1));
}

function summarizeDimension(
  dim: DimensionMatch,
  responses: ParticipantRecord[],
  opts: { canMisconception: boolean; canGain: boolean; canDirectChange: boolean }
): TopicMetric {
  const pick = (stage: "a" | "b" | "c", key?: string) =>
    !key
      ? []
      : responses
          .map((r) => r.answers[stage]?.[key])
          .filter((v): v is number => typeof v === "number");

  const aValues = pick("a", dim.a?.key);
  const bValues = pick("b", dim.b?.key);
  const cValues = pick("c", dim.c?.key);
  const a = average(aValues);
  const b = average(bValues);
  const c = average(cValues);

  let misconception = 0;
  if (opts.canMisconception && dim.a && dim.b) misconception = round(a - b);

  let gain = 0;
  if (opts.canGain && dim.b && dim.c) gain = round(c - b);
  else if (opts.canDirectChange && dim.a && dim.c && !dim.b) gain = round(c - a);

  let insight = `Average responses for ${dim.name.toLowerCase()} are summarized from uploaded forms.`;
  if (opts.canMisconception && dim.a && dim.b) {
    insight =
      misconception > 0
        ? `Participants initially rated their ${dim.name.toLowerCase()} higher than their retrospective assessment suggests.`
        : `Participants' retrospective view aligned closely with their original self-assessment of ${dim.name.toLowerCase()}.`;
  } else if (opts.canDirectChange && dim.a && dim.c) {
    insight = `Direct before/after change for ${dim.name.toLowerCase()} is ${gain >= 0 ? "+" : ""}${gain.toFixed(1)} points.`;
  }

  return {
    topic: resolveDimensionDisplayName(dim),
    a,
    b,
    c,
    misconception,
    gain,
    insight,
  };
}

const SATISFACTION_PATTERN = /(overall|satisfaction|satisfied|experience|enjoy)/i;
const FACILITATOR_PATTERN = /facilitator/i;
const SAFE_ENV_PATTERN = /safe.*(environment|space)|(environment|space).*safe/i;
const INSTRUCTIONS_PATTERN = /instruction/i;
const IDEAS_HEARD_PATTERN = /ideas?.*(heard|considered|valued)/i;
const RESPECT_PATTERN = /(respect|diverse\s+perspectives)/i;
const INDIVIDUAL_PREF_PATTERN = /(individually|rather than in a team|alone rather)/i;
const CHALLENGE_PATTERN = /challenge/i;
const STRENGTH_PATTERN = /strength/i;
const SUGGESTION_PATTERN = /(suggest|recommend|change|improve|feedback|advice)/i;

function matchesAny(patterns: RegExp[], text: string): boolean {
  return patterns.some((p) => p.test(text));
}

function buildStandaloneTopicMetrics(
  unmatched: UnmatchedNumeric[],
  presentStages: Array<"a" | "b" | "c">
): TopicMetric[] {
  const out: TopicMetric[] = [];
  for (const u of unmatched) {
    if (!presentStages.includes(u.stage) || u.values.length === 0) continue;
    if (!isPlausibleRatingValues(u.values)) continue;
    const label = humanMeasureLabel(u.ref);
    if (!label) continue;
    const avg = average(u.values);
    out.push({
      topic: label,
      a: u.stage === "a" ? avg : 0,
      b: u.stage === "b" ? avg : 0,
      c: u.stage === "c" ? avg : 0,
      misconception: 0,
      gain: 0,
      insight: `Average ${avg.toFixed(1)}/5 from ${u.values.length} response(s) on Form ${u.stage.toUpperCase()} (${label}).`,
    });
    if (out.length >= 24) break;
  }
  return out;
}

interface UnmatchedNumeric {
  stage: "a" | "b" | "c";
  ref: QuestionRef;
  values: number[];
}

export async function computeAnalytics(workshopId: string): Promise<AnalyticsSnapshot> {
  const [source, config] = await Promise.all([getAnalyticsSource(workshopId), getWorkshopDataConfig(workshopId)]);
  const { responses, dimensions, allQuestions } = source;

  const presentStages = (["a", "b", "c"] as const).filter((s) =>
    responses.some((r) => Object.keys(r.answers[s] ?? {}).length > 0)
  );
  const mode =
    presentStages.length > 0
      ? deriveAnalysisModeFromStages(presentStages)
      : (config.analysisMode ?? "single");
  const hasMatchedParticipants = responses.some((r) =>
    presentStages.every((s) => Object.keys(r.answers[s] ?? {}).length > 0)
  );
  const capabilities = deriveCapabilities(mode, presentStages, hasMatchedParticipants);

  const canMisconception = capabilities.includes("misconception_analysis") || capabilities.includes("perception_shift");
  const canGain = capabilities.includes("learning_gain");
  const canDirectChange = capabilities.includes("direct_change") || capabilities.includes("before_after");

  let topicMetrics = dimensions.map((d) =>
    summarizeDimension(d, responses, { canMisconception, canGain, canDirectChange })
  );

  const matchedKeys = new Set<string>();
  for (const d of dimensions) {
    if (d.a) matchedKeys.add(`a:${d.a.key}`);
    if (d.b) matchedKeys.add(`b:${d.b.key}`);
    if (d.c) matchedKeys.add(`c:${d.c.key}`);
  }

  const unmatchedNumeric: UnmatchedNumeric[] = [];
  const openTextByStage: Record<string, Array<{ text: string; values: string[] }>> = { a: [], b: [], c: [] };

  for (const q of allQuestions) {
    if (!isAnalysisQuestion(q.ref)) continue;
    if (matchedKeys.has(`${q.stage}:${q.ref.key}`)) continue;
    const values = responses
      .map((r) => r.answers[q.stage]?.[q.ref.key])
      .filter((v): v is number | string => v !== undefined && v !== null && v !== "");

    const numericValues = values.filter((v): v is number => typeof v === "number");
    if (
      numericValues.length >= Math.max(1, Math.floor(values.length * 0.5)) &&
      isPlausibleRatingValues(numericValues)
    ) {
      unmatchedNumeric.push({ stage: q.stage, ref: q.ref, values: numericValues });
    } else {
      openTextByStage[q.stage].push({
        text: q.ref.text,
        values: values.filter((v): v is string => typeof v === "string").map(String),
      });
    }
  }

  if (topicMetrics.length === 0) {
    topicMetrics = buildStandaloneTopicMetrics(unmatchedNumeric, presentStages);
  }

  topicMetrics = topicMetrics.filter((t) => isPlausibleTopicAverages(t.a, t.b, t.c));

  let overallSatisfaction: number | null = null;
  const satisfactionStages: Stage[] =
    mode === "single" && presentStages[0] === "a"
      ? []
      : presentStages.includes("c")
        ? ["c"]
        : [...presentStages];
  const satisfactionQ = unmatchedNumeric.find(
    (u) =>
      satisfactionStages.includes(u.stage) &&
      SATISFACTION_PATTERN.test(u.ref.text) &&
      humanMeasureLabel(u.ref)
  );
  if (satisfactionQ) {
    overallSatisfaction = average(satisfactionQ.values);
  }

  let facilitatorRating: number | null = null;
  let safeEnvironment: number | null = null;
  let clearInstructions: number | null = null;
  const facilitatorQ = unmatchedNumeric.find(
    (u) =>
      presentStages.includes(u.stage) &&
      FACILITATOR_PATTERN.test(u.ref.text) &&
      !SAFE_ENV_PATTERN.test(u.ref.text) &&
      !INSTRUCTIONS_PATTERN.test(u.ref.text)
  );
  if (facilitatorQ) facilitatorRating = average(facilitatorQ.values);
  const safeQ = unmatchedNumeric.find(
    (u) => presentStages.includes(u.stage) && SAFE_ENV_PATTERN.test(u.ref.text)
  );
  if (safeQ) safeEnvironment = average(safeQ.values);
  const instructionsQ = unmatchedNumeric.find(
    (u) => presentStages.includes(u.stage) && INSTRUCTIONS_PATTERN.test(u.ref.text)
  );
  if (instructionsQ) clearInstructions = average(instructionsQ.values);

  let collaboration: AnalyticsSnapshot["collaboration"] = null;
  const ideasQ = unmatchedNumeric.find(
    (u) => presentStages.includes(u.stage) && IDEAS_HEARD_PATTERN.test(u.ref.text)
  );
  const respectQ = unmatchedNumeric.find(
    (u) =>
      presentStages.includes(u.stage) &&
      RESPECT_PATTERN.test(u.ref.text) &&
      !IDEAS_HEARD_PATTERN.test(u.ref.text)
  );
  const individualQ = unmatchedNumeric.find(
    (u) => presentStages.includes(u.stage) && INDIVIDUAL_PREF_PATTERN.test(u.ref.text)
  );

  const openTextPool = presentStages.flatMap((s) => openTextByStage[s]);
  const strengths = openTextPool.filter((q) => STRENGTH_PATTERN.test(q.text)).flatMap((q) => q.values);
  const challenges = openTextPool.filter((q) => CHALLENGE_PATTERN.test(q.text)).flatMap((q) => q.values);

  if (ideasQ || respectQ || individualQ || strengths.length > 0 || challenges.length > 0) {
    collaboration = {
      ideasHeard: ideasQ ? average(ideasQ.values) : null,
      respect: respectQ ? average(respectQ.values) : null,
      teamPreference: individualQ ? average(individualQ.values) : null,
      strengths,
      challenges,
    };
  }

  const suggestionPool = openTextPool
    .filter((q) => SUGGESTION_PATTERN.test(q.text))
    .flatMap((q) => q.values);

  const facilitator =
    facilitatorRating !== null || safeEnvironment !== null || clearInstructions !== null || suggestionPool.length > 0
      ? {
          averageRating: facilitatorRating,
          safeEnvironment,
          clearInstructions,
          suggestions: suggestionPool,
        }
      : null;

  const activities = await extractWorkshopActivities({
    responses,
    presentStages,
    unmatchedNumeric,
    openTextByStage,
    allQuestions,
  });

  const postOrFinal = (t: TopicMetric) => (t.c > 0 ? t.c : t.b > 0 ? t.b : t.a);
  const skills = topicMetrics.map((t) => ({
    name: t.topic,
    value: Math.round((postOrFinal(t) / 5) * 100),
  }));

  const participants = responses.length;
  const completedSurveys = responses.filter((r) => {
    const hasA = Object.keys(r.answers.a ?? {}).length > 0;
    const hasB = Object.keys(r.answers.b ?? {}).length > 0;
    const hasC = Object.keys(r.answers.c ?? {}).length > 0;
    if (mode === "abc") return hasA && hasB && hasC;
    if (mode === "pre_post") return hasA && hasC;
    if (mode === "pre_retro") return hasA && hasB;
    if (mode === "retro_post") return hasB && hasC;
    return hasA || hasB || hasC;
  }).length;

  const gainMetrics =
    canGain
      ? topicMetrics.filter((t) => t.b > 0 && t.c > 0).map((t) => t.gain)
      : canDirectChange
        ? topicMetrics.filter((t) => t.a > 0 && t.c > 0).map((t) => t.gain)
        : [];
  const misconceptionMetrics = canMisconception
    ? topicMetrics.filter((t) => t.a > 0 && t.b > 0).map((t) => t.misconception)
    : [];

  const learningGainIndex = gainMetrics.length ? average(gainMetrics) : 0;
  const misconceptionCorrectionIndex = misconceptionMetrics.length ? average(misconceptionMetrics) : 0;
  const dimensionGrowth = canGain
    ? average(topicMetrics.filter((t) => t.b > 0 && t.c > 0).map((t) => t.c - t.b))
    : canDirectChange
      ? average(topicMetrics.filter((t) => t.a > 0 && t.c > 0).map((t) => t.gain))
      : 0;

  const proficiencyValues = topicMetrics.map((t) => postOrFinal(t)).filter((v) => v > 0);
  const avgProficiency = proficiencyValues.length ? average(proficiencyValues) : 0;
  const workshopImpactScore = computeOverviewImpactScore({
    capabilities,
    avgProficiency,
    learningGainIndex,
    overallSatisfaction,
    canGain,
    canDirectChange,
    presentStages,
  });

  const educatorInsights = buildOverviewEducatorInsights({
    mode,
    presentStages,
    participants,
    completedSurveys,
    topicMetrics,
    openTextByStage,
    overallSatisfaction,
    collaboration,
    canMisconception,
    canGain,
    canDirectChange,
    learningGainIndex,
    misconceptionCorrectionIndex,
  });

  const misconceptionInsights: InsightData[] = canMisconception
    ? topicMetrics.filter((t) => t.a > 0 && t.b > 0).map((t, i) => ({
        id: `misconception-${i}`,
        title: `${t.topic} perception shift`,
        description:
          t.misconception > 0
            ? `Participants overestimated their prior understanding by ${t.misconception.toFixed(1)} points.`
            : `Participants' retrospective view aligned closely with their understanding of ${t.topic}.`,
      }))
    : [];

  const learningGainInsights: InsightData[] =
    canGain
      ? topicMetrics
          .filter((t) => t.b > 0 && t.c > 0)
          .map((t, i) => ({
            id: `gain-${i}`,
            title: `${t.topic} learning gain`,
            description: `${t.gain.toFixed(1)} points from retrospective to post-workshop (Form B → C).`,
          }))
      : canDirectChange
        ? topicMetrics
            .filter((t) => t.a > 0 && t.c > 0)
            .map((t, i) => ({
              id: `gain-${i}`,
              title: `${t.topic} Pre → Post change`,
              description: `${t.gain.toFixed(1)} points between pre- and post-workshop (Form A → C).`,
            }))
        : [];

  return {
    workshopId,
    analysisMode: mode,
    capabilities,
    unavailableAnalyses: config.warnings,
    dataWarnings: config.warnings,
    participants,
    completedSurveys,
    dimensions: topicMetrics,
    workshopImpactScore,
    learningGainIndex,
    misconceptionCorrectionIndex,
    dimensionGrowth,
    overallSatisfaction,
    misconceptionInsights,
    learningGainInsights,
    skills,
    activities,
    facilitator,
    collaboration,
    educatorInsights,
  };
}
