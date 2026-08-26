import type {
  AnalyticsSnapshot,
  DimensionMatch,
  InsightData,
  ParticipantRecord,
  QuestionRef,
  TopicMetric,
} from "@/types";
import { getAnalyticsSource } from "./analytics-source";

function average(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function round(value: number): number {
  return Number(value.toFixed(1));
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function summarizeDimension(dim: DimensionMatch, responses: ParticipantRecord[]): TopicMetric {
  const pick = (stage: "a" | "b" | "c", key: string) =>
    responses
      .map((r) => r.answers[stage]?.[key])
      .filter((v): v is number => typeof v === "number");

  const aValues = pick("a", dim.a.key);
  const bValues = pick("b", dim.b.key);
  const cValues = pick("c", dim.c.key);
  const a = average(aValues);
  const b = average(bValues);
  const c = average(cValues);
  const misconception = round(a - b);
  const gain = round(c - b);

  return {
    topic: dim.name,
    a,
    b,
    c,
    misconception,
    gain,
    insight:
      misconception > 0
        ? `Participants initially rated their ${dim.name.toLowerCase()} higher than their retrospective assessment suggests.`
        : `Participants' retrospective view aligned closely with their original self-assessment of ${dim.name.toLowerCase()}.`,
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

interface UnmatchedNumeric {
  stage: "a" | "b" | "c";
  ref: QuestionRef;
  values: number[];
}

export async function computeAnalytics(workshopId: string): Promise<AnalyticsSnapshot> {
  const source = await getAnalyticsSource(workshopId);
  const { responses, dimensions, allQuestions } = source;

  const topicMetrics = dimensions.map((d) => summarizeDimension(d, responses));

  const matchedKeys = new Set<string>();
  for (const d of dimensions) {
    matchedKeys.add(`a:${d.a.key}`);
    matchedKeys.add(`b:${d.b.key}`);
    matchedKeys.add(`c:${d.c.key}`);
  }

  const unmatchedNumeric: UnmatchedNumeric[] = [];
  const openTextByStage: Record<string, Array<{ text: string; values: string[] }>> = { a: [], b: [], c: [] };

  for (const q of allQuestions) {
    if (matchedKeys.has(`${q.stage}:${q.ref.key}`)) continue;
    const values = responses
      .map((r) => r.answers[q.stage]?.[q.ref.key])
      .filter((v): v is number | string => v !== undefined && v !== null && v !== "");

    const numericValues = values.filter((v): v is number => typeof v === "number");
    if (numericValues.length >= Math.max(1, Math.floor(values.length * 0.5))) {
      unmatchedNumeric.push({ stage: q.stage, ref: q.ref, values: numericValues });
    } else {
      openTextByStage[q.stage].push({
        text: q.ref.text,
        values: values.filter((v): v is string => typeof v === "string").map(String),
      });
    }
  }

  let overallSatisfaction: number | null = null;
  const satisfactionQ = unmatchedNumeric.find((u) => SATISFACTION_PATTERN.test(u.ref.text));
  if (satisfactionQ) {
    overallSatisfaction = average(satisfactionQ.values);
  }

  let facilitatorRating: number | null = null;
  let safeEnvironment: number | null = null;
  let clearInstructions: number | null = null;
  const facilitatorQ = unmatchedNumeric.find(
    (u) => FACILITATOR_PATTERN.test(u.ref.text) && !SAFE_ENV_PATTERN.test(u.ref.text) && !INSTRUCTIONS_PATTERN.test(u.ref.text)
  );
  if (facilitatorQ) facilitatorRating = average(facilitatorQ.values);
  const safeQ = unmatchedNumeric.find((u) => SAFE_ENV_PATTERN.test(u.ref.text));
  if (safeQ) safeEnvironment = average(safeQ.values);
  const instructionsQ = unmatchedNumeric.find((u) => INSTRUCTIONS_PATTERN.test(u.ref.text));
  if (instructionsQ) clearInstructions = average(instructionsQ.values);

  let collaboration: AnalyticsSnapshot["collaboration"] = null;
  const ideasQ = unmatchedNumeric.find((u) => IDEAS_HEARD_PATTERN.test(u.ref.text));
  const respectQ = unmatchedNumeric.find((u) => RESPECT_PATTERN.test(u.ref.text) && !IDEAS_HEARD_PATTERN.test(u.ref.text));
  const individualQ = unmatchedNumeric.find((u) => INDIVIDUAL_PREF_PATTERN.test(u.ref.text));

  const strengths = openTextByStage.c
    .concat(openTextByStage.b)
    .filter((q) => STRENGTH_PATTERN.test(q.text))
    .flatMap((q) => q.values);
  const challenges = openTextByStage.c
    .concat(openTextByStage.b)
    .filter((q) => CHALLENGE_PATTERN.test(q.text))
    .flatMap((q) => q.values);

  if (ideasQ || respectQ || individualQ || strengths.length > 0 || challenges.length > 0) {
    collaboration = {
      ideasHeard: ideasQ ? average(ideasQ.values) : null,
      respect: respectQ ? average(respectQ.values) : null,
      teamPreference: individualQ ? average(individualQ.values) : null,
      strengths,
      challenges,
    };
  }

  const suggestionPool = openTextByStage.c
    .concat(openTextByStage.b, openTextByStage.a)
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

  const activities = buildActivityBattery(unmatchedNumeric);

  const skills = topicMetrics.map((t) => ({
    name: t.topic,
    value: Math.round((t.c / 5) * 100),
  }));

  const participants = responses.length;
  const completedSurveys = responses.filter((r) => {
    const hasA = Object.keys(r.answers.a ?? {}).length > 0;
    const hasB = Object.keys(r.answers.b ?? {}).length > 0;
    const hasC = Object.keys(r.answers.c ?? {}).length > 0;
    return hasA && hasB && hasC;
  }).length;

  const learningGainIndex = average(topicMetrics.map((t) => t.gain));
  const misconceptionCorrectionIndex = average(topicMetrics.map((t) => t.misconception));
  const dimensionGrowth = average(topicMetrics.map((t) => t.c - t.b));

  const avgC = average(topicMetrics.map((t) => t.c));
  const proficiencyPct = (avgC / 5) * 100;
  const gainPct = Math.max(0, Math.min(100, (learningGainIndex / 5) * 100 * 2));
  const satisfactionPct = overallSatisfaction !== null ? (overallSatisfaction / 5) * 100 : null;
  const workshopImpactScore = Math.round(
    0.5 * proficiencyPct +
      0.25 * gainPct +
      0.25 * (satisfactionPct ?? proficiencyPct)
  );

  const sortedByGain = [...topicMetrics].sort((a, b) => b.gain - a.gain);
  const topDim = sortedByGain[0];
  const bottomDim = sortedByGain[sortedByGain.length - 1];
  const biggestMisconception = [...topicMetrics].sort((a, b) => b.misconception - a.misconception)[0];

  const educatorInsights: string[] = [];
  if (topDim) {
    educatorInsights.push(
      `${topDim.topic} showed the strongest learning gain (+${topDim.gain.toFixed(1)} points from reflection to current understanding).`
    );
  }
  if (bottomDim && bottomDim !== topDim) {
    educatorInsights.push(
      `${bottomDim.topic} had the smallest gain (${bottomDim.gain >= 0 ? "+" : ""}${bottomDim.gain.toFixed(1)} points) — consider reinforcing it in future sessions.`
    );
  }
  if (biggestMisconception && biggestMisconception.misconception > 0) {
    educatorInsights.push(
      `The largest perception gap was in ${biggestMisconception.topic}: participants overestimated their starting point by ${biggestMisconception.misconception.toFixed(1)} points.`
    );
  }
  if (overallSatisfaction !== null) {
    educatorInsights.push(`Overall satisfaction averaged ${overallSatisfaction.toFixed(1)} out of 5 across the cohort.`);
  }

  const misconceptionInsights: InsightData[] = topicMetrics.map((t, i) => ({
    id: `misconception-${i}`,
    title: `${t.topic} perception shift`,
    description:
      t.misconception > 0
        ? `Participants overestimated their prior understanding by ${t.misconception.toFixed(1)} points.`
        : `Participants' retrospective view aligned closely with their understanding of ${t.topic}.`,
  }));

  const learningGainInsights: InsightData[] = topicMetrics.map((t, i) => ({
    id: `gain-${i}`,
    title: `${t.topic} learning gain`,
    description: `${t.gain.toFixed(1)} points of measured learning gain after the workshop.`,
  }));

  return {
    workshopId,
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

function buildActivityBattery(unmatched: UnmatchedNumeric[]): AnalyticsSnapshot["activities"] {
  const candidates = unmatched.filter(
    (u) => u.stage === "c" && average(u.values) > 0 && u.ref.text.length < 300
  );
  if (candidates.length < 3) return [];

  const tokensOf = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  const used = new Set<number>();
  const groups: UnmatchedNumeric[][] = [];

  for (let i = 0; i < candidates.length; i++) {
    if (used.has(i)) continue;
    const group = [candidates[i]];
    used.add(i);
    const baseTokens = new Set(tokensOf(candidates[i].ref.text));
    for (let j = i + 1; j < candidates.length; j++) {
      if (used.has(j)) continue;
      const otherTokens = tokensOf(candidates[j].ref.text);
      const overlap = otherTokens.filter((t) => baseTokens.has(t)).length;
      const overlapRatio = overlap / Math.min(baseTokens.size, otherTokens.length);
      if (overlapRatio >= 0.55) {
        group.push(candidates[j]);
        used.add(j);
      }
    }
    if (group.length >= 3) groups.push(group);
  }

  const activities: AnalyticsSnapshot["activities"] = [];
  for (const group of groups) {
    const tokenSets = group.map((g) => new Set(tokensOf(g.ref.text)));
    const sharedTokens = new Set<string>();
    for (const t of tokenSets[0]) {
      if (tokenSets.every((set) => set.has(t))) sharedTokens.add(t);
    }
    for (const member of group) {
      const distinctive = tokensOf(member.ref.text).filter((t) => !sharedTokens.has(t));
      const name = titleCase(distinctive.slice(0, 4).join(" ")) || member.ref.text.slice(0, 40);
      activities.push({
        name,
        rating: average(member.values),
        category: "Activity",
        description: member.ref.text.slice(0, 80),
      });
    }
  }

  return activities.sort((a, b) => b.rating - a.rating);
}
