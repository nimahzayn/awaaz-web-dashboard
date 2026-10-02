import type { AnalysisMode, Stage } from "@/types";
import type { AnalyticsSnapshot, TopicMetric } from "@/types";

const STAGE_LABEL: Record<Stage, string> = {
  a: "Form A (Pre)",
  b: "Form B (Pre-Retrospective)",
  c: "Form C (Post)",
};

function average(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(1));
}

function stageValue(t: TopicMetric, stage: Stage): number {
  if (stage === "a") return t.a;
  if (stage === "b") return t.b;
  return t.c;
}

function topicsWithStage(metrics: TopicMetric[], stage: Stage): TopicMetric[] {
  return metrics.filter((t) => stageValue(t, stage) > 0);
}

function strongestWeakest(
  metrics: TopicMetric[],
  stage: Stage
): { strong: TopicMetric | null; weak: TopicMetric | null } {
  const list = topicsWithStage(metrics, stage);
  if (!list.length) return { strong: null, weak: null };
  const sorted = [...list].sort((a, b) => stageValue(b, stage) - stageValue(a, stage));
  return { strong: sorted[0], weak: sorted[sorted.length - 1] };
}

function sampleQualThemes(
  openTextByStage: Record<string, Array<{ text: string; values: string[] }>>,
  stages: Stage[],
  maxThemes = 2
): string[] {
  const snippets: string[] = [];
  for (const stage of stages) {
    for (const block of openTextByStage[stage] ?? []) {
      for (const v of block.values) {
        const s = String(v).trim();
        if (s.length >= 12 && s.length <= 280) snippets.push(s);
      }
    }
  }
  return snippets.slice(0, maxThemes);
}

export interface OverviewInsightContext {
  mode: AnalysisMode;
  presentStages: Stage[];
  participants: number;
  completedSurveys: number;
  topicMetrics: TopicMetric[];
  openTextByStage: Record<string, Array<{ text: string; values: string[] }>>;
  overallSatisfaction: number | null;
  collaboration: AnalyticsSnapshot["collaboration"];
  canMisconception: boolean;
  canGain: boolean;
  canDirectChange: boolean;
  learningGainIndex: number;
  misconceptionCorrectionIndex: number;
}

export function buildOverviewEducatorInsights(ctx: OverviewInsightContext): string[] {
  const lines: string[] = [];
  const formsLabel = ctx.presentStages.map((s) => STAGE_LABEL[s]).join(", ");
  const ratingCount = ctx.topicMetrics.length;

  lines.push(
    `Analysis based on ${ctx.participants} participant record(s) from ${formsLabel}. ` +
      `${ctx.completedSurveys} record(s) include every uploaded form required for paired comparison in this mode.`
  );

  if (ratingCount === 0) {
    lines.push(
      "No comparable numeric rating questions were identified. Check that columns use readable question or outcome text rather than numeric IDs only."
    );
    appendQualitative(ctx, lines);
    return dedupe(lines).slice(0, 10);
  }

  switch (ctx.mode) {
    case "single":
      appendSingleForm(ctx, lines);
      break;
    case "pre_retro":
      appendPreRetro(ctx, lines);
      break;
    case "pre_post":
      appendPrePost(ctx, lines);
      break;
    case "retro_post":
      appendRetroPost(ctx, lines);
      break;
    case "abc":
      appendAbc(ctx, lines);
      break;
    default:
      appendSingleForm(ctx, lines);
  }

  appendQualitative(ctx, lines);
  appendCollaboration(ctx, lines);

  return dedupe(lines).slice(0, 12);
}

function appendSingleForm(ctx: OverviewInsightContext, lines: string[]) {
  const stage = ctx.presentStages[0]!;
  const { strong, weak } = strongestWeakest(ctx.topicMetrics, stage);
  const avgs = topicsWithStage(ctx.topicMetrics, stage).map((t) => stageValue(t, stage));
  const mean = average(avgs);

  if (stage === "a") {
    lines.push(
      `Pre-workshop baseline: ${avgs.length} rated measure(s) average ${mean.toFixed(1)}/5 (${ctx.participants} participants; each average uses only non-empty answers for that question).`
    );
    if (strong) {
      lines.push(`Strongest baseline: "${strong.topic}" (${stageValue(strong, stage).toFixed(1)}/5).`);
    }
    if (weak && weak !== strong) {
      lines.push(
        `Weakest baseline: "${weak.topic}" (${stageValue(weak, stage).toFixed(1)}/5) — consider emphasizing this in facilitation.`
      );
    }
    lines.push(
      "With Pre data only, learning gain, post-workshop outcomes, and post-event satisfaction are not calculated."
    );
  } else if (stage === "b") {
    lines.push(
      `Retrospective self-assessment (Form B): ${avgs.length} measure(s) average ${mean.toFixed(1)}/5.`
    );
    if (strong) lines.push(`Highest retrospective rating: "${strong.topic}" (${stageValue(strong, stage).toFixed(1)}/5).`);
    if (weak && weak !== strong) {
      lines.push(`Lowest retrospective rating: "${weak.topic}" (${stageValue(weak, stage).toFixed(1)}/5).`);
    }
    lines.push("Without Form A or C, Pre baseline and Pre→Post change are not calculated.");
  } else {
    lines.push(`Post-workshop (Form C): ${avgs.length} measure(s) average ${mean.toFixed(1)}/5.`);
    if (strong) lines.push(`Strongest post-workshop area: "${strong.topic}" (${stageValue(strong, stage).toFixed(1)}/5).`);
    if (weak && weak !== strong) {
      lines.push(`Weakest post-workshop area: "${weak.topic}" (${stageValue(weak, stage).toFixed(1)}/5).`);
    }
    if (ctx.overallSatisfaction !== null) {
      lines.push(`Satisfaction indicator from post-workshop responses: ${ctx.overallSatisfaction.toFixed(1)}/5.`);
    }
    lines.push("Without Form A, improvement from Pre is not calculated.");
  }
}

function appendPreRetro(ctx: OverviewInsightContext, lines: string[]) {
  const comparable = ctx.topicMetrics.filter((t) => t.a > 0 && t.b > 0);
  lines.push(`${comparable.length} matched Pre vs Pre-Retrospective measure(s) (Forms A and B).`);

  if (ctx.canMisconception && comparable.length > 0) {
    const sorted = [...comparable].sort((a, b) => b.misconception - a.misconception);
    const top = sorted[0];
    if (top.misconception > 0.2) {
      lines.push(
        `Largest Pre vs retrospective gap: "${top.topic}" (Pre ${top.a.toFixed(1)}, Retrospective ${top.b.toFixed(1)}, shift ${top.misconception >= 0 ? "+" : ""}${top.misconception.toFixed(1)}).`
      );
    } else {
      lines.push(
        `Pre and retrospective ratings align closely on "${top.topic}" (Pre ${top.a.toFixed(1)}, Retrospective ${top.b.toFixed(1)}).`
      );
    }
    if (Math.abs(ctx.misconceptionCorrectionIndex) > 0.05) {
      lines.push(
        `Average Pre minus Retrospective across matched measures: ${ctx.misconceptionCorrectionIndex >= 0 ? "+" : ""}${ctx.misconceptionCorrectionIndex.toFixed(1)} points.`
      );
    }
  }

  const { strong, weak } = strongestWeakest(ctx.topicMetrics, "b");
  if (strong) lines.push(`Strongest retrospective rating: "${strong.topic}" (${strong.b.toFixed(1)}/5).`);
  if (weak && weak !== strong) lines.push(`Weakest retrospective rating: "${weak.topic}" (${weak.b.toFixed(1)}/5).`);

  lines.push("Form C not uploaded — post-workshop learning gain and post-event satisfaction are not reported.");
}

function appendPrePost(ctx: OverviewInsightContext, lines: string[]) {
  const comparable = ctx.topicMetrics.filter((t) => t.a > 0 && t.c > 0);
  lines.push(`${comparable.length} matched Pre → Post measure(s) (Forms A and C).`);

  if (ctx.canDirectChange && comparable.length > 0) {
    const improved = comparable.filter((t) => t.gain > 0.2);
    const declined = comparable.filter((t) => t.gain < -0.2);

    if (improved.length) {
      const top = [...improved].sort((a, b) => b.gain - a.gain)[0];
      lines.push(
        `Largest Pre → Post increase: "${top.topic}" (${top.a.toFixed(1)} → ${top.c.toFixed(1)}, ${top.gain >= 0 ? "+" : ""}${top.gain.toFixed(1)} points).`
      );
    }
    if (declined.length) {
      const d = [...declined].sort((a, b) => a.gain - b.gain)[0];
      lines.push(
        `Largest Pre → Post decrease: "${d.topic}" (${d.a.toFixed(1)} → ${d.c.toFixed(1)}, ${d.gain.toFixed(1)} points).`
      );
    }
    if (Math.abs(ctx.learningGainIndex) > 0.05) {
      lines.push(
        `Average Pre → Post change across matched measures: ${ctx.learningGainIndex >= 0 ? "+" : ""}${ctx.learningGainIndex.toFixed(1)} points.`
      );
    }
  }

  if (ctx.overallSatisfaction !== null) {
    lines.push(`Post-workshop satisfaction: ${ctx.overallSatisfaction.toFixed(1)}/5.`);
  }

  lines.push("Form B not uploaded — retrospective-only comparisons are omitted.");
}

function appendRetroPost(ctx: OverviewInsightContext, lines: string[]) {
  const comparable = ctx.topicMetrics.filter((t) => t.b > 0 && t.c > 0);
  lines.push(`${comparable.length} matched Retrospective vs Post measure(s) (Forms B and C).`);

  if (ctx.canGain && comparable.length > 0) {
    const top = [...comparable].sort((a, b) => b.gain - a.gain)[0];
    if (Math.abs(top.gain) > 0.2) {
      lines.push(
        `Largest Retrospective → Post change: "${top.topic}" (${top.b.toFixed(1)} → ${top.c.toFixed(1)}, ${top.gain >= 0 ? "+" : ""}${top.gain.toFixed(1)} points).`
      );
    }
    if (Math.abs(ctx.learningGainIndex) > 0.05) {
      lines.push(
        `Average Retrospective → Post change: ${ctx.learningGainIndex >= 0 ? "+" : ""}${ctx.learningGainIndex.toFixed(1)} points.`
      );
    }
  }

  if (ctx.overallSatisfaction !== null) {
    lines.push(`Post-workshop satisfaction: ${ctx.overallSatisfaction.toFixed(1)}/5.`);
  }

  lines.push("Form A not uploaded — Pre baseline and Pre→Post change are not calculated.");
}

function appendAbc(ctx: OverviewInsightContext, lines: string[]) {
  const abc = ctx.topicMetrics.filter((t) => t.a > 0 && t.b > 0 && t.c > 0);
  lines.push(`${abc.length} measure(s) with Pre, Retrospective, and Post data.`);

  if (ctx.canMisconception && abc.length) {
    const misc = [...abc].sort((a, b) => b.misconception - a.misconception)[0];
    if (misc.misconception > 0.2) {
      lines.push(
        `Pre vs Retrospective: largest perception gap on "${misc.topic}" (${misc.misconception.toFixed(1)} points).`
      );
    }
  }

  if (ctx.canGain && abc.length) {
    const gain = [...abc].sort((a, b) => b.gain - a.gain)[0];
    if (Math.abs(gain.gain) > 0.2) {
      lines.push(
        `Retrospective → Post: strongest change on "${gain.topic}" (${gain.gain >= 0 ? "+" : ""}${gain.gain.toFixed(1)} points).`
      );
    }
  }

  const prePost = abc.filter((t) => t.a > 0 && t.c > 0);
  if (prePost.length) {
    const direct = prePost
      .map((t) => ({ t, direct: round1(t.c - t.a) }))
      .sort((a, b) => b.direct - a.direct)[0];
    if (Math.abs(direct.direct) > 0.2) {
      lines.push(
        `Pre → Post on "${direct.t.topic}": ${direct.t.a.toFixed(1)} → ${direct.t.c.toFixed(1)} (${direct.direct >= 0 ? "+" : ""}${direct.direct.toFixed(1)} points).`
      );
    }
  }

  if (ctx.overallSatisfaction !== null) {
    lines.push(`Post-workshop satisfaction: ${ctx.overallSatisfaction.toFixed(1)}/5.`);
  }
}

function round1(n: number): number {
  return Number(n.toFixed(1));
}

function appendQualitative(ctx: OverviewInsightContext, lines: string[]) {
  const themes = sampleQualThemes(ctx.openTextByStage, ctx.presentStages);
  if (!themes.length) return;
  lines.push(
    `Qualitative excerpt: “${themes[0].slice(0, 200)}${themes[0].length > 200 ? "…" : ""}”`
  );
  if (themes[1]) {
    lines.push(`Another theme: “${themes[1].slice(0, 160)}${themes[1].length > 160 ? "…" : ""}”`);
  }
}

function appendCollaboration(ctx: OverviewInsightContext, lines: string[]) {
  const c = ctx.collaboration;
  if (!c) return;
  if (c.strengths.length) {
    lines.push(`Strength noted in open responses: “${String(c.strengths[0]).slice(0, 180)}”`);
  }
  if (c.challenges.length) {
    lines.push(`Challenge noted in open responses: “${String(c.challenges[0]).slice(0, 180)}”`);
  }
}

function dedupe(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

export function computeOverviewImpactScore(args: {
  capabilities: string[];
  avgProficiency: number;
  learningGainIndex: number;
  overallSatisfaction: number | null;
  canGain: boolean;
  canDirectChange: boolean;
  presentStages: Stage[];
}): number {
  const proficiencyPct = args.avgProficiency > 0 ? (args.avgProficiency / 5) * 100 : 0;
  const satisfactionPct = args.overallSatisfaction !== null ? (args.overallSatisfaction / 5) * 100 : null;
  const hasGain = (args.canGain || args.canDirectChange) && Math.abs(args.learningGainIndex) > 0.05;
  const gainPct = hasGain
    ? Math.max(0, Math.min(100, (args.learningGainIndex / 5) * 100 * 2))
    : 0;
  const postPresent = args.presentStages.includes("c");

  if (args.capabilities.includes("impact_score") && proficiencyPct > 0 && hasGain && postPresent) {
    return Math.round(0.5 * proficiencyPct + 0.25 * gainPct + 0.25 * (satisfactionPct ?? proficiencyPct));
  }
  if (postPresent && satisfactionPct !== null) return Math.round(satisfactionPct);
  if (proficiencyPct > 0) return Math.round(proficiencyPct);
  if (satisfactionPct !== null) return Math.round(satisfactionPct);
  return 0;
}
