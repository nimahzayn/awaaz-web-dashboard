import { neon } from "@neondatabase/serverless";
import { computeAnalytics } from "../src/services/analytics";
import { getAnalyticsSource } from "../src/services/analytics-source";
import { findStructuredActivityRatingColumns } from "../src/services/activity-vocabulary";

const sql = neon(process.env.DATABASE_URL!);
const id = process.argv[2] ?? "ws-1790869311255-v6j5mo";

const rows = await sql`SELECT data FROM workshop_analytics WHERE workshop_id = ${id}`;
if (rows[0]?.data) {
  const a = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  console.log("CURRENT activities in DB:", JSON.stringify(a.activities?.slice(0, 8), null, 2));
}

const source = await getAnalyticsSource(id);
const presentStages = (["a", "b", "c"] as const).filter((s) =>
  source.responses.some((r) => Object.keys(r.answers[s] ?? {}).length > 0)
);

const matchedKeys = new Set<string>();
for (const d of source.dimensions) {
  if (d.a) matchedKeys.add(`a:${d.a.key}`);
  if (d.b) matchedKeys.add(`b:${d.b.key}`);
  if (d.c) matchedKeys.add(`c:${d.c.key}`);
}

const matchedActivity = source.dimensions.filter((d) =>
  /clay|river|6w|field|bingo|laptop|feelings|case study|intervention|drawing|game|mascot|problem solv|\[.*activit/i.test(
    `${d.name} ${d.a?.text ?? ""} ${d.b?.text ?? ""} ${d.c?.text ?? ""}`
  )
);
console.log("Matched dimensions activity-like:", matchedActivity.length);
for (const d of matchedActivity.slice(0, 15)) {
  console.log(" DIM:", d.name?.slice(0, 80), "|", (d.c?.text ?? d.b?.text ?? d.a?.text ?? "").slice(0, 80));
}

const unmatched: Array<{ stage: "a" | "b" | "c"; ref: { key: string; text: string }; values: number[] }> = [];
for (const q of source.allQuestions) {
  const values = source.responses
    .map((r) => r.answers[q.stage]?.[q.ref.key])
    .filter((v): v is number => typeof v === "number");
  if (values.length >= 1) unmatched.push({ stage: q.stage, ref: q.ref, values });
}

const clayish = unmatched.filter((u) =>
  /clay|river|6w|field|bingo|laptop|feelings|case study|intervention|drawing|game-based|ai-based|mascot|problem solv|activity/i.test(
    u.ref.text
  )
);
console.log("\nUnmatched numeric clayish headers:", clayish.length);
for (const u of clayish.slice(0, 20)) {
  console.log(" HDR:", u.ref.text.slice(0, 130));
}

const structured = findStructuredActivityRatingColumns(unmatched, presentStages);
console.log("\nStructured activity columns found:", structured.length);
for (const c of structured.slice(0, 15)) {
  console.log("-", c.displayName, "| n=", c.values.length);
}

const analytics = await computeAnalytics(id);
console.log("\nComputed activities:", analytics.activities.length);
for (const act of analytics.activities.slice(0, 12)) {
  console.log("-", act.name, act.rating, "|", act.description?.slice(0, 60));
}
