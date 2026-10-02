import { buildVocabEntry, matchOpenTextToVocabulary } from "../src/services/activity-vocabulary";

/** Alias-only fallback tests (no Gemini) — same cases as product spec. */
const VOCAB = [
  "Clay-based Activity",
  "Problem solving (6W+2H)",
  "Drawing-based (River of Life)",
  "Game-based (Bingo/cheers to constitution)",
  "Field activity",
].map((d) => buildVocabEntry(d));

type Case = { text: string; expect: string[] };

const cases: Case[] = [
  { text: "The activity was very useful.", expect: [] },
  { text: "I loved the clay activity.", expect: ["Clay-based Activity"] },
  { text: "The activity helped me understand teamwork.", expect: [] },
  { text: "River of Life was the most useful.", expect: ["Drawing-based (River of Life)"] },
  { text: "I liked the 6W2H problem solving exercise.", expect: ["Problem solving (6W+2H)"] },
  { text: "Gauri was very supportive during the activity.", expect: [] },
  {
    text: "The clay activity and River of Life were both useful.",
    expect: ["Clay-based Activity", "Drawing-based (River of Life)"],
  },
  { text: "I enjoyed the workshop and learned about teamwork.", expect: [] },
  { text: "I liked the bingo game.", expect: ["Game-based (Bingo/cheers to constitution)"] },
  { text: "Field activity was interesting.", expect: ["Field activity"] },
];

let failed = 0;
for (let i = 0; i < cases.length; i++) {
  const c = cases[i];
  const got = matchOpenTextToVocabulary(c.text, VOCAB).sort();
  const want = [...c.expect].sort();
  const ok = got.length === want.length && got.every((v, j) => v === want[j]);
  if (!ok) {
    failed++;
    console.error(`FAIL ${i + 1}:`, c.text);
    console.error("  want:", want);
    console.error("  got:", got);
  } else {
    console.log(`OK ${i + 1} (alias fallback)`);
  }
}
process.exit(failed ? 1 : 0);
