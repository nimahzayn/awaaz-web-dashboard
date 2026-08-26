import type { DimensionMatch, QuestionRef } from "@/types";

const ID_ALIASES = [
  "email", "mail", "emailaddress",
  "fullname", "name", "yourname",
  "participant", "participantid", "participantname",
  "respondent", "respondentid",
  "id",
  "fullnameasyoupreferonthecertificate",
  "1fullnameasyoupreferonthecertificate",
];

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "to", "for", "with", "by", "from",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "do", "does", "did", "would", "will", "can", "could", "should",
  "how", "what", "which", "who", "whom", "whose", "why", "when", "where",
  "you", "your", "yours", "i", "me", "my", "we", "our", "us", "they", "them", "their",
  "it", "its", "this", "that", "these", "those",
  "please", "feel", "free", "write", "answer", "following", "below", "above",
  "scale", "rate", "rating", "mark", "level", "extent", "degree", "much", "many",
  "question", "questions", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10",
]);

const STAGE_BOILERPLATE = [
  /(?:^|\b)thinking\s+back[^,]*/gi,
  /(?:^|\b)looking\s+back[^,]*/gi,
  /(?:^|\b)retrospectively,?/gi,
  /\bbefore\s+this\s+workshop\b/gi,
  /\bbefore\s+the\s+workshop\b/gi,
  /\bafter\s+this\s+workshop\b/gi,
  /\bafter\s+the\s+workshop\b/gi,
  /\bprior\s+to\s+(?:this\s+)?(?:workshop|attending|participating)/gi,
  /\bsubsequent\s+to\s+the\s+workshop\b/gi,
  /\bas\s+of\s+now\b/gi,
  /\bat\s+this\s+(?:point|moment|time)\b/gi,
  /\bthese\s+days\b/gi,
  /\bpresently\b/gi,
  /\bnowadays\b/gi,
  /\b(?:are|were)\s+you\s+now\b/gi,
  /\bhow\s+(?:confident|well|effective)\s+(?:are|were)\s+you\s+now\b/gi,
  /\brate\s+your\s+current\b/gi,
  /\byour\s+current\b/gi,
  /\bnow\b/gi,
  /\bcurrently\b/gi,
  /\btoday\b/gi,
  /\bwere\s+you\b/gi,
  /\bare\s+you\b/gi,
  /\bdid\s+you\b/gi,
  /\bdo\s+you\b/gi,
  /\bwould\s+you\b/gi,
  /\bhave\s+you\b/gi,
];

/** Maps stem tokens to canonical dimension labels. */
const TOKEN_CANONICAL: Record<string, string> = {
  leading: "leadership",
  lead: "leadership",
  leader: "leadership",
  collaborate: "collaboration",
  collaborating: "collaboration",
  communicate: "communication",
  communicating: "communication",
  decision: "decision",
  decisions: "decision",
  making: "making",
  justice: "justice",
  confident: "confidence",
  confidence: "confidence",
  understanding: "understanding",
  effective: "effectiveness",
  effectiveness: "effectiveness",
  abilities: "abilities",
  ability: "abilities",
  team: "team",
  teams: "team",
  group: "group",
  groups: "group",
  ideas: "ideas",
  people: "people",
  backgrounds: "backgrounds",
  social: "social",
  issues: "issues",
};

/** Qualifier words kept when naming dimensions alongside specific tokens. */
const QUALIFIER_WORDS = new Set([
  "confidence",
  "confident",
  "understanding",
  "understand",
  "effectiveness",
  "effective",
  "abilities",
  "ability",
  "awareness",
  "knowledge",
]);

/** Generic words removed unless they are the only shared signal. */
const GENERIC_ONLY = new Set([
  "skill",
  "skills",
  "competency",
  "competencies",
  "workshop",
  "session",
  "sessions",
  "program",
  "training",
  "module",
  "think",
  "thinking",
  "feel",
  "feeling",
  "felt",
  "believe",
  "perceive",
  "rate",
  "rating",
  "mark",
  "level",
  "extent",
  "degree",
  "much",
  "many",
  "well",
  "good",
  "different",
  "from",
  "with",
  "your",
  "you",
]);

export interface ParsedSheet {
  headers: Record<string, string>;
  rows: Record<string, any>[];
}

export function normalizeHeader(value: string): string {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function detectIdColumn(headers: string[], rows: Record<string, any>[]): string {
  const normalizedAliases = ID_ALIASES.map(normalizeHeader);
  for (const alias of normalizedAliases) {
    const col = headers.find((h) => normalizeHeader(h) === alias);
    if (col && rows.some((r) => r[normalizeHeader(col)] !== undefined && String(r[normalizeHeader(col)]).trim() !== "")) {
      return normalizeHeader(col);
    }
  }
  for (const alias of normalizedAliases) {
    const col = headers.find((h) => normalizeHeader(h).includes(alias));
    if (col && rows.some((r) => r[normalizeHeader(col)] !== undefined && String(r[normalizeHeader(col)]).trim() !== "")) {
      return normalizeHeader(col);
    }
  }
  return "";
}

const NAME_COLUMN_RE =
  /^(?:full(?:name)?|first(?:name)?|last(?:name)?|given(?:name)?|sur(?:name)?|middle(?:name)?|name|yourname|yourfullname|participantname|respondentname|nameonyourcertificate|.*prefer.*certificate|certificate.*name)$/;

export function isNameColumn(key: string): boolean {
  const cleaned = String(key ?? "").toLowerCase().replace(/[^a-z]/g, "");
  return NAME_COLUMN_RE.test(cleaned);
}

export function extractQuestions(headers: Record<string, string>, idColumn: string): QuestionRef[] {
  const questions: QuestionRef[] = [];
  for (const [key, display] of Object.entries(headers)) {
    if (!key || key === idColumn) continue;
    const text = String(display ?? "").trim();
    if (!text) continue;
    if (isNameColumn(key)) continue;
    questions.push({ key, text });
  }
  return questions;
}

export function stripStageWording(text: string): string {
  let result = String(text ?? "");
  result = result.replace(/^\s*(?:\d+[.)]?|[qQ]\d+[.)]?)\s*/, "");
  for (const pattern of STAGE_BOILERPLATE) {
    result = result.replace(pattern, " ");
  }
  return result.replace(/\s+/g, " ").trim();
}

export function tokenize(text: string): string[] {
  return stripStageWording(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function bigrams(tokens: string[]): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) {
    set.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

export function questionSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const tokenScore = jaccard(new Set(tokensA), new Set(tokensB));
  const bigramScore = jaccard(bigrams(tokensA), bigrams(tokensB));
  return tokenScore * 0.6 + bigramScore * 0.4;
}

const MATCH_THRESHOLD = 0.28;
const C_MATCH_THRESHOLD = 0.22;

interface Pairing {
  pairs: Array<{ aIdx: number; bIdx: number; score: number }>;
  unmatchedA: number[];
  unmatchedB: number[];
}

function greedyPair(scores: number[][], sizeA: number, sizeB: number): Pairing {
  const candidates: Array<{ a: number; b: number; score: number }> = [];
  for (let i = 0; i < sizeA; i++) {
    for (let j = 0; j < sizeB; j++) {
      if (scores[i][j] >= MATCH_THRESHOLD) {
        candidates.push({ a: i, b: j, score: scores[i][j] });
      }
    }
  }
  candidates.sort((x, y) => y.score - x.score);

  const usedA = new Set<number>();
  const usedB = new Set<number>();
  const pairs: Array<{ aIdx: number; bIdx: number; score: number }> = [];

  for (const c of candidates) {
    if (usedA.has(c.a) || usedB.has(c.b)) continue;
    usedA.add(c.a);
    usedB.add(c.b);
    pairs.push({ aIdx: c.a, bIdx: c.b, score: c.score });
  }

  const unmatchedA: number[] = [];
  const unmatchedB: number[] = [];
  for (let i = 0; i < sizeA; i++) if (!usedA.has(i)) unmatchedA.push(i);
  for (let j = 0; j < sizeB; j++) if (!usedB.has(j)) unmatchedB.push(j);

  return { pairs, unmatchedA, unmatchedB };
}

function positionalFallback(unmatchedA: number[], unmatchedB: number[]): Array<{ aIdx: number; bIdx: number }> {
  const pairs: Array<{ aIdx: number; bIdx: number }> = [];
  const n = Math.min(unmatchedA.length, unmatchedB.length);
  for (let k = 0; k < n; k++) {
    pairs.push({ aIdx: unmatchedA[k], bIdx: unmatchedB[k] });
  }
  return pairs;
}

function canonicalizeToken(token: string): string {
  return TOKEN_CANONICAL[token] ?? token;
}

function canonicalizeTokens(tokens: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const token of tokens) {
    const canonical = canonicalizeToken(token);
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }
  return result;
}

function titleCaseTokens(tokens: string[]): string {
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" ");
}

export function deriveDimensionName(refs: QuestionRef[]): string {
  const tokenSets = refs.map((r) => new Set(tokenize(r.text)));
  const shared = [...tokenSets[0]].filter((t) =>
    tokenSets.every((set) => set.has(t))
  );

  const canonicalShared = canonicalizeTokens(shared);
  const specific = canonicalShared.filter((t) => !GENERIC_ONLY.has(t) && !QUALIFIER_WORDS.has(t));
  const qualifiers = canonicalShared.filter((t) => QUALIFIER_WORDS.has(t));

  let nameTokens: string[] = [];

  if (specific.length > 0) {
    nameTokens = [...specific.slice(0, 3)];
    if (qualifiers.length > 0 && !nameTokens.includes(qualifiers[0])) {
      nameTokens.push(qualifiers[0]);
    }
  } else if (qualifiers.length > 0) {
    nameTokens = qualifiers.slice(0, 2);
  } else {
    const union = new Set<string>();
    tokenSets.forEach((set) =>
      set.forEach((t) => union.add(canonicalizeToken(t)))
    );
    nameTokens = [...union]
      .filter((t) => !GENERIC_ONLY.has(t))
      .slice(0, 3);
  }

  if (nameTokens.length === 0) {
    nameTokens = canonicalShared.slice(0, 2);
  }
  if (nameTokens.length === 0) {
    nameTokens = ["Dimension"];
  }

  return titleCaseTokens(nameTokens.slice(0, 4));
}

export function matchDimensions(
  questionsA: QuestionRef[],
  questionsB: QuestionRef[],
  questionsC: QuestionRef[]
): DimensionMatch[] {
  const scoreAB = questionsA.map((qa) => questionsB.map((qb) => questionSimilarity(qa.text, qb.text)));
  const abPairing = greedyPair(scoreAB, questionsA.length, questionsB.length);

  const clusters: Array<{ a: QuestionRef; b: QuestionRef; aIdx: number }> = abPairing.pairs.map((p) => ({
    a: questionsA[p.aIdx],
    b: questionsB[p.bIdx],
    aIdx: p.aIdx,
  }));

  const leftoverA = abPairing.unmatchedA.map((i) => questionsA[i]);
  const leftoverB = abPairing.unmatchedB.map((j) => questionsB[j]);
  if (leftoverA.length > 0 && leftoverB.length === leftoverA.length) {
    const fallback = positionalFallback(abPairing.unmatchedA, abPairing.unmatchedB);
    for (const f of fallback) {
      clusters.push({ a: questionsA[f.aIdx], b: questionsB[f.bIdx], aIdx: f.aIdx });
    }
  }

  const usedC = new Set<number>();
  const dimensions: DimensionMatch[] = [];
  const usedNames = new Map<string, number>();

  for (const cluster of clusters) {
    let bestCIdx = -1;
    let bestScore = 0;

    for (let ci = 0; ci < questionsC.length; ci++) {
      if (usedC.has(ci)) continue;
      const score =
        (questionSimilarity(cluster.a.text, questionsC[ci].text) +
          questionSimilarity(cluster.b.text, questionsC[ci].text)) /
        2;
      if (score >= C_MATCH_THRESHOLD && score > bestScore) {
        bestScore = score;
        bestCIdx = ci;
      }
    }

    // Positional fallback only when similarity is weak but the same slot likely aligns
    if (bestCIdx === -1) {
      const positional = cluster.aIdx;
      if (
        positional < questionsC.length &&
        !usedC.has(positional)
      ) {
        const positionalScore =
          (questionSimilarity(cluster.a.text, questionsC[positional].text) +
            questionSimilarity(cluster.b.text, questionsC[positional].text)) /
          2;
        if (positionalScore >= 0.12) {
          bestCIdx = positional;
        }
      }
    }

    if (bestCIdx === -1) continue;
    usedC.add(bestCIdx);

    const refs = [cluster.a, cluster.b, questionsC[bestCIdx]];
    let name = deriveDimensionName(refs);
    const count = usedNames.get(name) ?? 0;
    usedNames.set(name, count + 1);
    if (count > 0) name = `${name} ${count + 1}`;

    dimensions.push({
      id: `dim-${dimensions.length + 1}`,
      name,
      a: cluster.a,
      b: cluster.b,
      c: questionsC[bestCIdx],
    });
  }

  return dimensions;
}

export type AnswerValue = number | string | string[];

export function parseAnswerValue(raw: any): AnswerValue {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return raw;
  const str = String(raw).trim();
  if (!str) return "";
  const parsed = Number(str);
  if (Number.isFinite(parsed)) return parsed;

  const lower = str.toLowerCase();
  if (lower.includes("strongly agree")) return 5;
  if (lower.includes("strongly disagree")) return 1;
  if (lower.includes("disagree")) return 2;
  if (lower.includes("agree")) return 4;
  if (lower.includes("neutral") || lower.includes("undecided") || lower.includes("maybe")) return 3;
  if (lower.includes("deep and nuanced")) return 5;
  if (lower.includes("good understanding") || lower.includes("very good") || lower.includes("excellent")) return 5;
  if (lower.includes("good understanding")) return 4;
  if (lower.includes("good")) return 4;
  if (lower.includes("basic understanding") || lower.includes("average") || lower.includes("developing understanding")) return 3;
  if (lower.includes("little to no") || lower.includes("below average")) return 2;
  if (lower.includes("poor") || lower.includes("no understanding") || lower.includes("none") || lower.includes("never") || lower.includes("very little")) return 1;

  if (/[|;,]/.test(str)) {
    return str.split(/[|;,]/).map((item) => item.trim()).filter(Boolean);
  }
  return str;
}

export function isNumericValue(value: AnswerValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function detectScaleMax(values: number[]): number {
  const max = Math.max(...values.filter((v) => v > 0), 0);
  if (max <= 0) return 5;
  if (max <= 5) return 5;
  if (max <= 7) return 7;
  if (max <= 10) return 10;
  if (max <= 100) return 100;
  return max;
}
