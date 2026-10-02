import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { matchOpenTextToVocabulary, type ActivityVocabEntry } from "./activity-vocabulary";

const BATCH_SIZE = 10;
const MAX_TEXT_LEN = 500;
const DEFAULT_GEMINI_MAX_UNIQUE = 48;
const BATCH_TIMEOUT_MS = 20_000;

function geminiMaxUniqueTexts(): number {
  const raw = process.env.ACTIVITY_GEMINI_MAX_TEXTS?.trim();
  const n = raw ? Number(raw) : DEFAULT_GEMINI_MAX_UNIQUE;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 200) : DEFAULT_GEMINI_MAX_UNIQUE;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

function readGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    undefined
  );
}

function logDebug(message: string, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development" || process.env.ACTIVITY_DEBUG === "1") {
    if (extra) console.log("[activity-analysis]", message, extra);
    else console.log("[activity-analysis]", message);
  }
}

function normalizeForMatch(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

/** Keep only names that exactly match the canonical list (after whitespace normalize). */
export function validateAgainstCanonical(
  returned: string[],
  canonicalActivities: string[]
): string[] {
  const canonicalByNorm = new Map<string, string>();
  for (const c of canonicalActivities) {
    canonicalByNorm.set(normalizeForMatch(c).toLowerCase(), c);
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of returned) {
    const key = normalizeForMatch(String(raw ?? "")).toLowerCase();
    const exact = canonicalByNorm.get(key);
    if (!exact || seen.has(exact)) continue;
    seen.add(exact);
    out.push(exact);
  }
  return out;
}

function fallbackClassify(text: string, vocab: ActivityVocabEntry[]): string[] {
  return matchOpenTextToVocabulary(text, vocab);
}

async function classifyBatchWithGemini(
  texts: string[],
  canonicalActivities: string[]
): Promise<Map<string, string[]>> {
  const apiKey = readGeminiApiKey();
  const result = new Map<string, string[]>();
  if (!apiKey) return result;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          results: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                activities: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
              },
              required: ["id", "activities"],
            },
          },
        },
        required: ["results"],
      },
    },
  });

  const items = texts.map((text, i) => ({
    id: String(i),
    response: text.slice(0, MAX_TEXT_LEN),
  }));

  const prompt = `You classify workshop participant comments against a FIXED list of workshop activities.

RULES (strict):
- Return ONLY activity names from the canonical list below. Use EXACT spelling/capitalization from the list.
- If the comment only says "the activity" without naming WHICH activity, return [].
- Never return sentences, participant names, facilitators, skills (e.g. teamwork), emotions, or invented activity names.
- Map obvious aliases to the canonical name (e.g. clay/clay activity → Clay-based Activity; River of Life → Drawing-based (River of Life); 6W2H → Problem solving (6W+2H); bingo game → Game-based (...)).
- Generic praise of "the activity" or "activities" with no identifiable workshop activity → [].

Canonical activities (ONLY valid outputs):
${JSON.stringify(canonicalActivities, null, 2)}

Participant responses (classify each by id):
${JSON.stringify(items, null, 2)}

Return JSON: { "results": [ { "id": "0", "activities": ["Exact Canonical Name"] }, ... ] }`;

  const response = await model.generateContent(prompt);
  const raw = response.response.text();
  const parsed = JSON.parse(raw) as {
    results?: Array<{ id: string; activities?: string[] }>;
  };

  for (const row of parsed.results ?? []) {
    const idx = Number(row.id);
    const text = texts[idx];
    if (!text) continue;
    const validated = validateAgainstCanonical(row.activities ?? [], canonicalActivities);
    result.set(text, validated);
    if (process.env.NODE_ENV === "development" && texts.length <= 3) {
      logDebug("Gemini sample", {
        responsePreview: text.slice(0, 80),
        raw: row.activities,
        validated,
      });
    }
  }

  return result;
}

/**
 * Classify open-ended responses against the canonical activity list.
 * Uses Gemini when GEMINI_API_KEY is set; otherwise deterministic alias matching only (never full sentences).
 */
export async function classifyOpenTextActivities(args: {
  texts: string[];
  canonicalActivities: string[];
  vocab: ActivityVocabEntry[];
}): Promise<Map<string, string[]>> {
  const { texts, canonicalActivities, vocab } = args;
  const uniqueAll = [...new Set(texts.map((t) => t.trim()).filter((t) => t.length >= 4))];
  const maxGemini = geminiMaxUniqueTexts();
  const unique = uniqueAll.slice(0, maxGemini);
  const out = new Map<string, string[]>();

  if (uniqueAll.length > unique.length) {
    logDebug("Gemini text cap applied", {
      total: uniqueAll.length,
      classified: unique.length,
    });
  }

  logDebug("Canonical activity list", {
    count: canonicalActivities.length,
    sample: canonicalActivities.slice(0, 5),
  });

  const cache = new Map<string, string[]>();
  const apiKey = readGeminiApiKey();
  const useGemini = Boolean(apiKey) && process.env.ACTIVITY_SKIP_GEMINI !== "1";

  if (!useGemini) {
    logDebug("Gemini skipped — alias-only fallback for open-text mentions");
    for (const t of uniqueAll) {
      out.set(t, fallbackClassify(t, vocab));
    }
    return out;
  }

  logDebug("Gemini enabled for activity mention classification", {
    uniqueResponses: unique.length,
  });

  const pending: string[] = [];
  for (const t of unique) {
    if (cache.has(t)) {
      out.set(t, cache.get(t)!);
      continue;
    }
    pending.push(t);
  }

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    try {
      const batchResult = await withTimeout(
        classifyBatchWithGemini(batch, canonicalActivities),
        BATCH_TIMEOUT_MS,
        "Gemini activity batch"
      );
      for (const t of batch) {
        const raw = batchResult.get(t) ?? [];
        const matched = validateAgainstCanonical(raw, canonicalActivities);
        cache.set(t, matched);
        out.set(t, matched);
      }
    } catch (err) {
      console.error("[activity-analysis] Gemini batch failed, using alias fallback:", err);
      for (const t of batch) {
        const fb = fallbackClassify(t, vocab);
        cache.set(t, fb);
        out.set(t, fb);
      }
    }
  }

  return out;
}

/** Exported for unit tests (no API call). */
export async function classifySingleForTest(
  text: string,
  canonicalActivities: string[],
  vocab: ActivityVocabEntry[]
): Promise<string[]> {
  const map = await classifyOpenTextActivities({
    texts: [text],
    canonicalActivities,
    vocab,
  });
  return map.get(text.trim()) ?? [];
}
