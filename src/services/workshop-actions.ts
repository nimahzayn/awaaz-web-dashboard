"use server";

import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import type { SurveyResponse, Workshop } from "@/types";
import {
  getWorkshop,
  getWorkshopFilePaths,
  readWorkshopFile,
  writeWorkshopFile,
  updateWorkshopStatus,
  workshopHasData,
} from "./workshops";

type SheetRow = Record<string, string>;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseCsv(content: string): SheetRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  const pushValue = () => { currentRow.push(currentValue); currentValue = ""; };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') { currentValue += '"'; i++; } else { inQuotes = !inQuotes; }
      continue;
    }
    if (char === "," && !inQuotes) { pushValue(); continue; }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      pushValue();
      rows.push(currentRow);
      currentRow = [];
      continue;
    }
    currentValue += char;
  }
  if (currentValue || currentRow.length) { pushValue(); rows.push(currentRow); }

  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row) => {
    const obj: SheetRow = {};
    headers.forEach((h, i) => { obj[normalizeHeader(h)] = (row[i] || "").trim(); });
    return obj;
  });
}

function toNumber(value: string | undefined): number {
  if (!value) return 3;
  const normalized = value.toLowerCase().trim();
  const map: Record<string, number> = {
    "strongly agree": 5, "agree": 4, "somewhat agree": 4, "neutral": 3,
    "somewhat disagree": 2, "disagree": 1, "strongly disagree": 1,
    "deep and nuanced understanding": 5, "good understanding": 4,
    "developing understanding": 3, "basic understanding": 2, "minimal understanding": 1,
    "excellent": 5, "very good": 4, "good": 3.5, "average": 3, "below average": 2, "poor": 1,
  };
  if (map[normalized] !== undefined) return map[normalized];
  const num = parseFloat(normalized);
  return isNaN(num) ? 3 : Math.min(5, Math.max(1, num));
}

function extractPreRow(row: SheetRow): Record<string, any> {
  return {
    fullname: (row["fullname"] || row["whatisyourname"] || "").toLowerCase().trim(),
    email: (row["emailaddress"] || row["email"] || "").toLowerCase().trim(),
    q5: {
      caste: toNumber(row["howwellyoudoyouunderstandtheconceptofcasteindia"]),
      gender: toNumber(row["howwellyoudoyouunderstandgenderrolesandequality"]),
      religion: toNumber(row["howwellyoudoyouunderstandreligiousdiversityandcommunalharmony"]),
    },
    q7: toNumber(row["howeffectivedoyouthinkcreativeteachingmethodswillbeinhelpingyoulearnaboutjustice"]),
    q8: toNumber(row["howconfidentareyouinyourabilitytoidentifyandaddresssocialinjusticeissuesinyourcommunity"]),
    q11: toNumber(row["howawareareyouofyourowncitizenrightsandresponsibilitiesinsociety"]),
  };
}

function extractPostRow(row: SheetRow): Record<string, any> {
  return {
    fullname: (row["fullname"] || row["whatisyourname"] || "").toLowerCase().trim(),
    email: (row["emailaddress"] || row["email"] || "").toLowerCase().trim(),
    q12: toNumber(row["howawareareyouofyourowncitizenrightsandresponsibilitiesinsociety"] || row["q12"]),
    q14: {
      caste: toNumber(row["aftertheworkshophowwellyoudoyouunderstandtheconceptofcasteindia"] || row["howwellyoudoyouunderstandtheconceptofcasteindia"]),
      gender: toNumber(row["aftertheworkshophowwellyoudoyouunderstandgenderrolesandequality"] || row["howwellyoudoyouunderstandgenderrolesandequality"]),
      religion: toNumber(row["aftertheworkshophowwellyoudoyouunderstandreligiousdiversityandcommunalharmony"] || row["howwellyoudoyouunderstandreligiousdiversityandcommunalharmony"]),
    },
    q15: {
      caste: toNumber(row["howwellyoudoyounowunderstandtheconceptofcasteindia"] || row["afterreflectionhowwellyoudoyouunderstandtheconceptofcasteindia"]),
      gender: toNumber(row["howwellyoudoyounowunderstandgenderrolesandequality"] || row["afterreflectionhowwellyoudoyouunderstandgenderrolesandequality"]),
      religion: toNumber(row["howwellyoudoyounowunderstandreligiousdiversityandcommunalharmony"] || row["afterreflectionhowwellyoudoyouunderstandreligiousdiversityandcommunalharmony"]),
    },
    q18: toNumber(row["howeffectivedoyouthinkcreativeteachingmethodswereinhelpingyoulearnaboutjustice"]),
    q19: toNumber(row["howhasyoureunderstandingofcreativepedagogieschanged"]),
    q21: toNumber(row["howconfidentareyounowinyourabilitytoidentifyandaddresssocialinjusticeissues"]),
    q22: toNumber(row["howhasyoureproblem solvingconfidencechanged"] || row["howhasyoureproblemsolvingconfidencechanged"]),
    ideasHeard: toNumber(row["howwelldoyoufeelideasyourideasinthisworkshopwereheardandvalued"]),
    respect: toNumber(row["howmuchdidyoufeelrespectfordiverseperspectivesduringthisworkshop"]),
    teamPreference: toNumber(row["howmuchdoyoupreferworkinginteamsafterthisworkshop"]),
    strengths: row["whatwerethestrengthsofyourteam"] ? row["whatwerethestrengthsofyourteam"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    challenges: row["whatchallengesdidyourteamface"] ? row["whatchallengesdidyourteamface"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    teamValues: row["whatvaluesdidyourteamshare"] ? row["whatvaluesdidyourteamshare"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    visioningExercise: row["whatdidyouenvisionforthefuture"] ? row["whatdidyouenvisionforthefuture"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    clayActivity: toNumber(row["rateyourlearningfromtheclayactivity"]),
    sixW2h: toNumber(row["rateyourlearningfromthe6w2hactivity"]),
    riverOfLife: toNumber(row["rateyourlearningfromtheriveroflifeactivity"]),
    aiActivity: toNumber(row["rateyourlearningfromtheaiactivity"]),
    gameActivity: toNumber(row["rateyourlearningfromthegameactivity"]),
    laptopActivity: toNumber(row["rateyourlearningfromthelaptopactivity"]),
    fieldActivity: toNumber(row["rateyourlearningfromthefieldactivity"]),
    feelingsChart: toNumber(row["rateyourlearningfromthefeelingschartactivity"]),
    caseStudy: toNumber(row["rateyourlearningfromthecasestudyactivity"]),
    interventionPlanning: toNumber(row["rateyourlearningfromtheinterventionplanningactivity"]),
    leadership: toNumber(row["ratethefollowing skillsdevelopedduringtheworkshopleadership"]),
    criticalThinking: toNumber(row["ratethefollowing skillsdevelopedduringtheworkshopcriticalthinking"]),
    empathy: toNumber(row["ratethefollowing skillsdevelopedduringtheworkshopempathy"]),
    problemSolving: toNumber(row["ratethefollowing skillsdevelopedduringtheworkshopproblemsolving"]),
    communication: toNumber(row["ratethefollowing skillsdevelopedduringtheworkshopcommunication"]),
    justiceUnderstanding: toNumber(row["ratethefollowing skillsdevelopedduringtheworkshopjusticeunderstanding"]),
    facilitatorRating: toNumber(row["howwouldyouratetheoverallfacilitationofthisworkshop"]),
    safeLearningEnvironment: toNumber(row["howwelldidthefacilitatorcreateasafelearningenvironment"]),
    clearInstructions: toNumber(row["howclearweretheinstructionsgivenbythefacilitator"]),
    overallSatisfaction: toNumber(row["howwouldyouratetheoverallqualityofthisworkshop"]),
    suggestions: row["whatsuggestionsdoyouhaveforfutureworkshops"] ? row["whatsuggestionsdoyouhaveforfutureworkshops"].split(";").map((s: string) => s.trim()).filter(Boolean) : [],
  };
}

function mergeDatasets(preRows: Record<string, any>[], postRows: Record<string, any>[]): SurveyResponse[] {
  const matched: SurveyResponse[] = [];
  const used = new Set<number>();

  for (const pre of preRows) {
    let bestIdx = -1;
    for (let i = 0; i < postRows.length; i++) {
      if (used.has(i)) continue;
      const preKey = pre.fullname || pre.email;
      const postKey = postRows[i].fullname || postRows[i].email;
      if (preKey && postKey && preKey === postKey) { bestIdx = i; break; }
    }
    if (bestIdx === -1) {
      for (let i = 0; i < postRows.length; i++) {
        if (used.has(i)) continue;
        if (pre.fullname && postRows[i].fullname && pre.fullname.includes(postRows[i].fullname)) { bestIdx = i; break; }
      }
    }
    if (bestIdx === -1) {
      for (let i = 0; i < postRows.length; i++) {
        if (used.has(i)) { bestIdx = i; break; }
      }
    }
    if (bestIdx >= 0) {
      used.add(bestIdx);
      matched.push({
        id: pre.fullname || pre.email || `p-${matched.length + 1}`,
        pre: { q5: pre.q5, q7: pre.q7, q8: pre.q8, q11: pre.q11 },
        post: { ...postRows[bestIdx] },
      } as SurveyResponse);
    }
  }
  return matched;
}

export async function uploadPreWorkshop(workshopId: string, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase();
  let rows: SheetRow[] = [];

  if (ext === "csv") {
    rows = parseCsv(buffer.toString("utf-8"));
  } else if (ext === "xlsx" || ext === "xls") {
    const wb = xlsx.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = xlsx.utils.sheet_to_json<SheetRow>(ws);
    rows = rows.map((row) => {
      const obj: SheetRow = {};
      for (const [k, v] of Object.entries(row)) { obj[normalizeHeader(k)] = String(v ?? "").trim(); }
      return obj;
    });
  } else {
    return { success: false, error: "Unsupported file format. Please upload CSV or XLSX." };
  }

  if (!rows.length) return { success: false, error: "No data found in file." };

  const extracted = rows.map(extractPreRow);
  await writeWorkshopFile(workshopId, "pre_responses.json", extracted);

  const ws = await getWorkshop(workshopId);
  await updateWorkshopStatus(workshopId, "uploaded", {
    preUploadedAt: new Date().toISOString(),
    preCount: extracted.length,
  });

  await tryMerge(workshopId);

  return { success: true, count: extracted.length };
}

export async function uploadPostWorkshop(workshopId: string, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase();
  let rows: SheetRow[] = [];

  if (ext === "csv") {
    rows = parseCsv(buffer.toString("utf-8"));
  } else if (ext === "xlsx" || ext === "xls") {
    const wb = xlsx.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = xlsx.utils.sheet_to_json<SheetRow>(ws);
    rows = rows.map((row) => {
      const obj: SheetRow = {};
      for (const [k, v] of Object.entries(row)) { obj[normalizeHeader(k)] = String(v ?? "").trim(); }
      return obj;
    });
  } else {
    return { success: false, error: "Unsupported file format. Please upload CSV or XLSX." };
  }

  if (!rows.length) return { success: false, error: "No data found in file." };

  const extracted = rows.map(extractPostRow);
  await writeWorkshopFile(workshopId, "post_responses.json", extracted);

  await updateWorkshopStatus(workshopId, "uploaded", {
    postUploadedAt: new Date().toISOString(),
    postCount: extracted.length,
  });

  await tryMerge(workshopId);

  return { success: true, count: extracted.length };
}

async function tryMerge(workshopId: string) {
  const pre = await readWorkshopFile(workshopId, "pre_responses.json");
  const post = await readWorkshopFile(workshopId, "post_responses.json");
  if (!pre || !post) return;

  const merged = mergeDatasets(pre, post);
  await writeWorkshopFile(workshopId, "survey_responses.json", merged);
  await updateWorkshopStatus(workshopId, "uploaded", { matchedCount: merged.length });
}

export async function generateAnalysis(workshopId: string) {
  const status = await workshopHasData(workshopId);
  if (!status.pre || !status.post) {
    return { success: false, error: "Both pre and post workshop surveys must be uploaded first." };
  }

  const { computeAnalytics } = await import("./analytics");
  const analytics = await computeAnalytics(workshopId);
  await writeWorkshopFile(workshopId, "analysis.json", analytics);
  await updateWorkshopStatus(workshopId, "analyzed", { analyzedAt: new Date().toISOString() });

  return { success: true };
}
