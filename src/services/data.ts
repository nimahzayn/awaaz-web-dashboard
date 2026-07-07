import type { SurveyResponse } from "@/types";

type SheetRow = Record<string, string>;

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseCsv(content: string): SheetRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  const pushValue = () => {
    currentRow.push(currentValue);
    currentValue = "";
  };

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      pushValue();
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      pushValue();
      rows.push(currentRow);
      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    pushValue();
    rows.push(currentRow);
  }

  if (!rows.length) {
    return [];
  }

  const [headers, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const normalizedRow: SheetRow = {};
      headers.forEach((header, index) => {
        normalizedRow[normalizeHeader(header)] = row[index] ?? "";
      });
      return normalizedRow;
    });
}

function parseList(value: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCell(row: SheetRow, aliases: string[]): string {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const value = row[normalizedAlias];
    if (value !== undefined && value !== "") {
      return value;
    }
  }

  return "";
}

function toNumber(value: number | string | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function buildSurveyResponsesFromSheetRows(rows: SheetRow[]): SurveyResponse[] {
  return rows.map((row) => ({
    email: getCell(row, ["email"]).trim(),
    pre: {
      q5: {
        caste: toNumber(getCell(row, ["pre_q5_caste", "q5caste", "q5Caste"])),
        gender: toNumber(
          getCell(row, ["pre_q5_gender", "q5gender", "q5Gender"]),
        ),
        religion: toNumber(
          getCell(row, ["pre_q5_religion", "q5religion", "q5Religion"]),
        ),
      },
      q7: toNumber(getCell(row, ["pre_q7", "q7"])),
      q8: toNumber(getCell(row, ["pre_q8", "q8"])),
      q11: toNumber(getCell(row, ["pre_q11", "q11"])),
    },
    post: {
      q12: toNumber(getCell(row, ["post_q12", "q12"])),
      q14: {
        caste: toNumber(
          getCell(row, ["post_q14_caste", "q14caste", "q14Caste"]),
        ),
        gender: toNumber(
          getCell(row, ["post_q14_gender", "q14gender", "q14Gender"]),
        ),
        religion: toNumber(
          getCell(row, ["post_q14_religion", "q14religion", "q14Religion"]),
        ),
      },
      q15: {
        caste: toNumber(
          getCell(row, ["post_q15_caste", "q15caste", "q15Caste"]),
        ),
        gender: toNumber(
          getCell(row, ["post_q15_gender", "q15gender", "q15Gender"]),
        ),
        religion: toNumber(
          getCell(row, ["post_q15_religion", "q15religion", "q15Religion"]),
        ),
      },
      q18: toNumber(getCell(row, ["post_q18", "q18"])),
      q19: toNumber(getCell(row, ["post_q19", "q19"])),
      q21: toNumber(getCell(row, ["post_q21", "q21"])),
      q22: toNumber(getCell(row, ["post_q22", "q22"])),
      ideasHeard: toNumber(getCell(row, ["ideasheard", "ideasHeard"])),
      respect: toNumber(getCell(row, ["respect"])),
      teamPreference: toNumber(
        getCell(row, ["teampreference", "teamPreference"]),
      ),
      strengths: parseList(getCell(row, ["strengths"])),
      challenges: parseList(getCell(row, ["challenges"])),
      teamValues: parseList(getCell(row, ["teamvalues", "teamValues"])),
      visioningExercise: parseList(
        getCell(row, ["visioningexercise", "visioningExercise"]),
      ),
      clayActivity: toNumber(getCell(row, ["clayactivity", "clayActivity"])),
      sixW2h: toNumber(getCell(row, ["sixw2h", "sixW2h"])),
      riverOfLife: toNumber(getCell(row, ["riveroflife", "riverOfLife"])),
      aiActivity: toNumber(getCell(row, ["aiactivity", "aiActivity"])),
      gameActivity: toNumber(getCell(row, ["gameactivity", "gameActivity"])),
      laptopActivity: toNumber(
        getCell(row, ["laptopactivity", "laptopActivity"]),
      ),
      fieldActivity: toNumber(getCell(row, ["fieldactivity", "fieldActivity"])),
      feelingsChart: toNumber(getCell(row, ["feelingschart", "feelingsChart"])),
      caseStudy: toNumber(getCell(row, ["casestudy", "caseStudy"])),
      interventionPlanning: toNumber(
        getCell(row, ["interventionplanning", "interventionPlanning"]),
      ),
      facilitatorRating: toNumber(
        getCell(row, ["facilitatorrating", "facilitatorRating"]),
      ),
      safeLearningEnvironment: toNumber(
        getCell(row, ["safelearningenvironment", "safeLearningEnvironment"]),
      ),
      clearInstructions: toNumber(
        getCell(row, ["clearinstructions", "clearInstructions"]),
      ),
      leadership: toNumber(getCell(row, ["leadership"])),
      criticalThinking: toNumber(
        getCell(row, ["criticalthinking", "criticalThinking"]),
      ),
      empathy: toNumber(getCell(row, ["empathy"])),
      problemSolving: toNumber(
        getCell(row, ["problemsolving", "problemSolving"]),
      ),
      communication: toNumber(getCell(row, ["communication"])),
      justiceUnderstanding: toNumber(
        getCell(row, ["justiceunderstanding", "justiceUnderstanding"]),
      ),
      overallSatisfaction: toNumber(
        getCell(row, ["overallsatisfaction", "overallSatisfaction"]),
      ),
      suggestions: parseList(getCell(row, ["suggestions"])),
    },
  }));
}

async function loadSurveyResponsesFromSheet(): Promise<SurveyResponse[]> {
  const sheetUrl =
    process.env.GOOGLE_SHEET_CSV_URL ??
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL;

  if (!sheetUrl) {
    return [];
  }

  try {
    const response = await fetch(sheetUrl, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }

    const csv = await response.text();
    const rows = parseCsv(csv);
    return buildSurveyResponsesFromSheetRows(rows);
  } catch {
    return [];
  }
}

const PRE_WORKSHOP_RESPONSES: Array<Record<string, number | string>> = [
  {
    email: "maya@awaaz.org",
    q5Caste: 3.2,
    q5Gender: 2.8,
    q5Religion: 2.6,
    q7: 3.0,
    q8: 2.9,
    q11: 2.7,
  },
  {
    email: "rajesh@awaaz.org",
    q5Caste: 3.5,
    q5Gender: 3.1,
    q5Religion: 2.9,
    q7: 3.2,
    q8: 3.0,
    q11: 3.0,
  },
  {
    email: "nidhi@awaaz.org",
    q5Caste: 2.8,
    q5Gender: 2.6,
    q5Religion: 2.4,
    q7: 2.7,
    q8: 2.8,
    q11: 2.5,
  },
  {
    email: "arjun@awaaz.org",
    q5Caste: 3.4,
    q5Gender: 3.0,
    q5Religion: 2.8,
    q7: 3.1,
    q8: 3.2,
    q11: 2.9,
  },
  {
    email: "sana@awaaz.org",
    q5Caste: 3.0,
    q5Gender: 2.7,
    q5Religion: 2.3,
    q7: 2.8,
    q8: 2.9,
    q11: 2.6,
  },
  {
    email: "kavya@awaaz.org",
    q5Caste: 3.1,
    q5Gender: 3.2,
    q5Religion: 2.9,
    q7: 3.0,
    q8: 3.1,
    q11: 2.8,
  },
  {
    email: "mohit@awaaz.org",
    q5Caste: 2.9,
    q5Gender: 2.5,
    q5Religion: 2.7,
    q7: 2.8,
    q8: 2.7,
    q11: 2.4,
  },
  {
    email: "priya@awaaz.org",
    q5Caste: 3.6,
    q5Gender: 3.3,
    q5Religion: 3.0,
    q7: 3.4,
    q8: 3.3,
    q11: 3.1,
  },
];

const POST_WORKSHOP_RESPONSES: Array<
  Record<string, number | string | string[]>
> = [
  {
    email: "maya@awaaz.org",
    q14Caste: 2.2,
    q14Gender: 2.1,
    q14Religion: 2.0,
    q15Caste: 4.0,
    q15Gender: 4.1,
    q15Religion: 3.8,
    q18: 4.2,
    q19: 4.1,
    q21: 3.6,
    q22: 4.0,
    q12: 4.2,
    ideasHeard: 4.3,
    respect: 4.1,
    teamPreference: 4.0,
    strengths: ["listening", "empathy", "reflection"],
    challenges: ["communication", "time"],
    teamValues: ["inclusion", "solidarity"],
    visioningExercise: ["action", "school"],
    clayActivity: 4.8,
    sixW2h: 4.2,
    riverOfLife: 4.6,
    aiActivity: 4.1,
    gameActivity: 3.9,
    laptopActivity: 3.7,
    fieldActivity: 4.0,
    feelingsChart: 4.4,
    caseStudy: 4.5,
    interventionPlanning: 4.3,
    facilitatorRating: 4.6,
    safeLearningEnvironment: 4.7,
    clearInstructions: 4.4,
    leadership: 4.3,
    criticalThinking: 4.5,
    empathy: 4.8,
    problemSolving: 4.2,
    communication: 4.1,
    justiceUnderstanding: 4.6,
    overallSatisfaction: 4.3,
    suggestions: ["more case studies", "deeper reflection"],
  },
  {
    email: "rajesh@awaaz.org",
    q14Caste: 2.8,
    q14Gender: 2.7,
    q14Religion: 2.5,
    q15Caste: 4.2,
    q15Gender: 4.3,
    q15Religion: 4.0,
    q18: 4.0,
    q19: 3.9,
    q21: 3.7,
    q22: 4.1,
    q12: 4.0,
    ideasHeard: 4.1,
    respect: 4.0,
    teamPreference: 3.9,
    strengths: ["dialogue", "curiosity"],
    challenges: ["dominant voices"],
    teamValues: ["respect", "shared goals"],
    visioningExercise: ["community"],
    clayActivity: 4.4,
    sixW2h: 4.0,
    riverOfLife: 4.3,
    aiActivity: 4.2,
    gameActivity: 4.0,
    laptopActivity: 3.8,
    fieldActivity: 3.9,
    feelingsChart: 4.1,
    caseStudy: 4.2,
    interventionPlanning: 4.0,
    facilitatorRating: 4.4,
    safeLearningEnvironment: 4.5,
    clearInstructions: 4.2,
    leadership: 4.0,
    criticalThinking: 4.1,
    empathy: 4.2,
    problemSolving: 4.0,
    communication: 4.0,
    justiceUnderstanding: 4.3,
    overallSatisfaction: 4.1,
    suggestions: ["more time for discussion"],
  },
  {
    email: "nidhi@awaaz.org",
    q14Caste: 2.3,
    q14Gender: 2.2,
    q14Religion: 2.0,
    q15Caste: 3.9,
    q15Gender: 4.0,
    q15Religion: 3.7,
    q18: 4.4,
    q19: 4.3,
    q21: 3.8,
    q22: 4.2,
    q12: 4.3,
    ideasHeard: 4.2,
    respect: 4.3,
    teamPreference: 4.1,
    strengths: ["trust", "listening"],
    challenges: ["time"],
    teamValues: ["care", "inclusion"],
    visioningExercise: ["action", "justice"],
    clayActivity: 4.9,
    sixW2h: 4.1,
    riverOfLife: 4.5,
    aiActivity: 4.0,
    gameActivity: 4.2,
    laptopActivity: 3.9,
    fieldActivity: 4.1,
    feelingsChart: 4.2,
    caseStudy: 4.3,
    interventionPlanning: 4.4,
    facilitatorRating: 4.7,
    safeLearningEnvironment: 4.8,
    clearInstructions: 4.5,
    leadership: 4.4,
    criticalThinking: 4.6,
    empathy: 4.7,
    problemSolving: 4.3,
    communication: 4.2,
    justiceUnderstanding: 4.5,
    overallSatisfaction: 4.4,
    suggestions: ["more facilitation prompts"],
  },
  {
    email: "arjun@awaaz.org",
    q14Caste: 2.5,
    q14Gender: 2.4,
    q14Religion: 2.2,
    q15Caste: 4.1,
    q15Gender: 4.2,
    q15Religion: 3.9,
    q18: 3.9,
    q19: 4.0,
    q21: 3.5,
    q22: 3.9,
    q12: 3.9,
    ideasHeard: 4.0,
    respect: 3.9,
    teamPreference: 3.8,
    strengths: ["shared goals", "curiosity"],
    challenges: ["communication", "energy"],
    teamValues: ["solidarity", "collective care"],
    visioningExercise: ["planning"],
    clayActivity: 4.2,
    sixW2h: 4.1,
    riverOfLife: 4.0,
    aiActivity: 3.8,
    gameActivity: 3.7,
    laptopActivity: 3.6,
    fieldActivity: 3.8,
    feelingsChart: 4.0,
    caseStudy: 4.1,
    interventionPlanning: 4.2,
    facilitatorRating: 4.3,
    safeLearningEnvironment: 4.1,
    clearInstructions: 4.0,
    leadership: 3.9,
    criticalThinking: 4.0,
    empathy: 4.1,
    problemSolving: 3.8,
    communication: 3.9,
    justiceUnderstanding: 4.2,
    overallSatisfaction: 4.0,
    suggestions: ["additional examples"],
  },
  {
    email: "sana@awaaz.org",
    q14Caste: 2.4,
    q14Gender: 2.3,
    q14Religion: 2.1,
    q15Caste: 4.1,
    q15Gender: 4.0,
    q15Religion: 3.8,
    q18: 4.3,
    q19: 4.2,
    q21: 3.9,
    q22: 4.1,
    q12: 4.1,
    ideasHeard: 4.2,
    respect: 4.2,
    teamPreference: 4.0,
    strengths: ["empathy", "listening"],
    challenges: ["dominant voices"],
    teamValues: ["care", "respect"],
    visioningExercise: ["community", "action"],
    clayActivity: 4.7,
    sixW2h: 4.3,
    riverOfLife: 4.4,
    aiActivity: 4.1,
    gameActivity: 4.0,
    laptopActivity: 3.8,
    fieldActivity: 4.0,
    feelingsChart: 4.2,
    caseStudy: 4.3,
    interventionPlanning: 4.1,
    facilitatorRating: 4.5,
    safeLearningEnvironment: 4.6,
    clearInstructions: 4.3,
    leadership: 4.2,
    criticalThinking: 4.4,
    empathy: 4.6,
    problemSolving: 4.1,
    communication: 4.2,
    justiceUnderstanding: 4.4,
    overallSatisfaction: 4.2,
    suggestions: ["more reflective prompts"],
  },
  {
    email: "kavya@awaaz.org",
    q14Caste: 2.6,
    q14Gender: 2.5,
    q14Religion: 2.3,
    q15Caste: 4.0,
    q15Gender: 4.1,
    q15Religion: 3.8,
    q18: 4.1,
    q19: 3.8,
    q21: 3.7,
    q22: 4.0,
    q12: 4.0,
    ideasHeard: 4.0,
    respect: 4.1,
    teamPreference: 3.9,
    strengths: ["trust", "reflection"],
    challenges: ["time"],
    teamValues: ["solidarity", "justice"],
    visioningExercise: ["school"],
    clayActivity: 4.3,
    sixW2h: 4.0,
    riverOfLife: 4.1,
    aiActivity: 3.9,
    gameActivity: 3.8,
    laptopActivity: 3.7,
    fieldActivity: 3.9,
    feelingsChart: 4.0,
    caseStudy: 4.0,
    interventionPlanning: 4.1,
    facilitatorRating: 4.2,
    safeLearningEnvironment: 4.3,
    clearInstructions: 4.0,
    leadership: 4.0,
    criticalThinking: 4.2,
    empathy: 4.3,
    problemSolving: 3.9,
    communication: 4.0,
    justiceUnderstanding: 4.1,
    overallSatisfaction: 4.0,
    suggestions: ["more real-world context"],
  },
  {
    email: "mohit@awaaz.org",
    q14Caste: 2.1,
    q14Gender: 2.0,
    q14Religion: 1.9,
    q15Caste: 3.8,
    q15Gender: 3.9,
    q15Religion: 3.6,
    q18: 4.2,
    q19: 4.0,
    q21: 3.8,
    q22: 4.1,
    q12: 4.2,
    ideasHeard: 4.1,
    respect: 4.0,
    teamPreference: 4.0,
    strengths: ["curiosity", "action"],
    challenges: ["communication"],
    teamValues: ["inclusion", "care"],
    visioningExercise: ["community", "planning"],
    clayActivity: 4.5,
    sixW2h: 4.2,
    riverOfLife: 4.3,
    aiActivity: 4.0,
    gameActivity: 4.1,
    laptopActivity: 3.8,
    fieldActivity: 4.0,
    feelingsChart: 4.1,
    caseStudy: 4.2,
    interventionPlanning: 4.3,
    facilitatorRating: 4.4,
    safeLearningEnvironment: 4.6,
    clearInstructions: 4.2,
    leadership: 4.1,
    criticalThinking: 4.3,
    empathy: 4.4,
    problemSolving: 4.0,
    communication: 4.1,
    justiceUnderstanding: 4.3,
    overallSatisfaction: 4.2,
    suggestions: ["more collaborative debriefs"],
  },
  {
    email: "priya@awaaz.org",
    q14Caste: 2.7,
    q14Gender: 2.6,
    q14Religion: 2.4,
    q15Caste: 4.3,
    q15Gender: 4.4,
    q15Religion: 4.1,
    q18: 4.5,
    q19: 4.4,
    q21: 4.0,
    q22: 4.3,
    q12: 4.4,
    ideasHeard: 4.4,
    respect: 4.3,
    teamPreference: 4.2,
    strengths: ["leadership", "empathy"],
    challenges: ["time", "focus"],
    teamValues: ["shared goals", "justice"],
    visioningExercise: ["action", "reflection"],
    clayActivity: 4.8,
    sixW2h: 4.4,
    riverOfLife: 4.6,
    aiActivity: 4.2,
    gameActivity: 4.3,
    laptopActivity: 3.9,
    fieldActivity: 4.2,
    feelingsChart: 4.4,
    caseStudy: 4.5,
    interventionPlanning: 4.6,
    facilitatorRating: 4.8,
    safeLearningEnvironment: 4.9,
    clearInstructions: 4.6,
    leadership: 4.5,
    criticalThinking: 4.7,
    empathy: 4.8,
    problemSolving: 4.4,
    communication: 4.5,
    justiceUnderstanding: 4.7,
    overallSatisfaction: 4.5,
    suggestions: ["more leadership practice"],
  },
];

function buildMergedResponses(): SurveyResponse[] {
  const preByEmail = new Map<string, Record<string, number | string>>();
  for (const item of PRE_WORKSHOP_RESPONSES) {
    preByEmail.set(String(item.email), item);
  }

  const merged: SurveyResponse[] = [];

  for (const post of POST_WORKSHOP_RESPONSES) {
    const pre = preByEmail.get(String(post.email));
    if (!pre) {
      continue;
    }

    merged.push({
      email: String(post.email),
      pre: {
        q5: {
          caste: toNumber(pre.q5Caste),
          gender: toNumber(pre.q5Gender),
          religion: toNumber(pre.q5Religion),
        },
        q7: toNumber(pre.q7),
        q8: toNumber(pre.q8),
        q11: toNumber(pre.q11),
      },
      post: {
        q12: toNumber(post.q12),
        q14: {
          caste: toNumber(post.q14Caste),
          gender: toNumber(post.q14Gender),
          religion: toNumber(post.q14Religion),
        },
        q15: {
          caste: toNumber(post.q15Caste),
          gender: toNumber(post.q15Gender),
          religion: toNumber(post.q15Religion),
        },
        q18: toNumber(post.q18),
        q19: toNumber(post.q19),
        q21: toNumber(post.q21),
        q22: toNumber(post.q22),
        ideasHeard: toNumber(post.ideasHeard),
        respect: toNumber(post.respect),
        teamPreference: toNumber(post.teamPreference),
        strengths: Array.isArray(post.strengths)
          ? post.strengths.map(String)
          : [],
        challenges: Array.isArray(post.challenges)
          ? post.challenges.map(String)
          : [],
        teamValues: Array.isArray(post.teamValues)
          ? post.teamValues.map(String)
          : [],
        visioningExercise: Array.isArray(post.visioningExercise)
          ? post.visioningExercise.map(String)
          : [],
        clayActivity: toNumber(post.clayActivity),
        sixW2h: toNumber(post.sixW2h),
        riverOfLife: toNumber(post.riverOfLife),
        aiActivity: toNumber(post.aiActivity),
        gameActivity: toNumber(post.gameActivity),
        laptopActivity: toNumber(post.laptopActivity),
        fieldActivity: toNumber(post.fieldActivity),
        feelingsChart: toNumber(post.feelingsChart),
        caseStudy: toNumber(post.caseStudy),
        interventionPlanning: toNumber(post.interventionPlanning),
        facilitatorRating: toNumber(post.facilitatorRating),
        safeLearningEnvironment: toNumber(post.safeLearningEnvironment),
        clearInstructions: toNumber(post.clearInstructions),
        leadership: toNumber(post.leadership),
        criticalThinking: toNumber(post.criticalThinking),
        empathy: toNumber(post.empathy),
        problemSolving: toNumber(post.problemSolving),
        communication: toNumber(post.communication),
        justiceUnderstanding: toNumber(post.justiceUnderstanding),
        overallSatisfaction: toNumber(post.overallSatisfaction),
        suggestions: Array.isArray(post.suggestions)
          ? post.suggestions.map(String)
          : [],
      },
    });
  }

  return merged;
}

export const MOCK_SURVEY_RESPONSES = buildMergedResponses();

export async function getSurveyResponses(): Promise<SurveyResponse[]> {
  const fromSheet = await loadSurveyResponsesFromSheet();
  if (fromSheet.length) {
    return fromSheet;
  }

  return MOCK_SURVEY_RESPONSES;
}
