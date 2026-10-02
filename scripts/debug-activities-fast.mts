import { neon } from "@neondatabase/serverless";
import { getAnalyticsSource } from "../src/services/analytics-source";
import { extractWorkshopActivities } from "../src/services/activity-extraction";
import { isAnalysisQuestion, isPlausibleRatingValues } from "../src/services/measure-labels";
import {
  extractGridActivityFromHeader,
  findStructuredActivityRatingColumns,
  resolveStructuredActivityDisplayName,
} from "../src/services/activity-vocabulary";

const sql = neon(process.env.DATABASE_URL!);
const id = process.argv[2] ?? "ws-1790869311255-v6j5mo";

const source = await getAnalyticsSource(id);
const presentStages = (["a", "b", "c"] as const).filter((s) =>
  source.responses.some((r) => Object.keys(r.answers[s] ?? {}).length > 0)
);

const openTextByStage: Record<string, Array<{ text: string; values: string[] }>> = { a: [], b: [], c: [] };
const matchedKeys = new Set<string>();
for (const d of source.dimensions) {
  if (d.a) matchedKeys.add(`a:${d.a.key}`);
  if (d.b) matchedKeys.add(`b:${d.b.key}`);
  if (d.c) matchedKeys.add(`c:${d.c.key}`);
}

for (const q of source.allQuestions) {
  if (!isAnalysisQuestion(q.ref)) continue;
  if (matchedKeys.has(`${q.stage}:${q.ref.key}`)) continue;
  const values = source.responses
    .map((r) => r.answers[q.stage]?.[q.ref.key])
    .filter((v): v is number | string => v !== undefined && v !== null && v !== "");
  const numericValues = values.filter((v): v is number => typeof v === "number");
  if (numericValues.length >= 1 && isPlausibleRatingValues(numericValues)) continue;
  openTextByStage[q.stage].push({
    text: q.ref.text,
    values: values.filter((v): v is string => typeof v === "string").map(String),
  });
}

const numericPool = source.allQuestions
  .filter((q) => presentStages.includes(q.stage) && isAnalysisQuestion(q.ref))
  .map((q) => {
    const values = source.responses
      .map((r) => r.answers[q.stage]?.[q.ref.key])
      .filter((v): v is number => typeof v === "number");
    return { stage: q.stage, ref: q.ref, values };
  })
  .filter((u) => u.values.length > 0 && isPlausibleRatingValues(u.values));

const q20 = numericPool.filter((u) => /most effective in this shift/i.test(u.ref.text));
console.log("Q20 numeric cols:", q20.length);
for (const u of q20.slice(0, 3)) {
  console.log(" resolve:", resolveStructuredActivityDisplayName(u.ref.text));
}

const structured = findStructuredActivityRatingColumns(numericPool, [...presentStages]);
console.log("Structured cols:", structured.length);
for (const c of structured) console.log(" ", c.displayName);

const activities = await extractWorkshopActivities({
  responses: source.responses,
  presentStages: [...presentStages],
  openTextByStage,
  allQuestions: source.allQuestions,
});

console.log("Activities:", activities.length);
for (const a of activities) {
  console.log("-", a.name, "| rating", a.rating, "|", a.category);
}

const gridHeaders = source.allQuestions
  .map((q) => q.ref.text)
  .filter((t) => /\[[^\]]+\]/.test(t));
console.log("\nGrid bracket sample resolves:");
for (const h of gridHeaders.slice(0, 5)) {
  console.log(extractGridActivityFromHeader(h), "<=", h.slice(-50));
}
