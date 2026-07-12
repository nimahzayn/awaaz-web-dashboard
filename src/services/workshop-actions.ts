"use server";

import fs from "fs";
import path from "path";
<<<<<<< HEAD
import * as XLSX from "xlsx";
import type { SurveyResponse, Workshop } from "@/types";
import {
  getWorkshop,
=======
import * as xlsx from "xlsx";
import type { SurveyResponse, Workshop } from "@/types";
import {
  getWorkshop,
  getWorkshopFilePaths,
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  readWorkshopFile,
  writeWorkshopFile,
  updateWorkshopStatus,
  workshopHasData,
} from "./workshops";

type SheetRow = Record<string, string>;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

<<<<<<< HEAD
function normalizeRowKeys(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeHeader(key)] = value;
  }
  return normalized;
}

function getCell(row: Record<string, any>, aliases: string[]): string {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const value = row[normalizedAlias];
    if (value !== undefined && value !== "") {
      return String(value);
    }
  }
  return "";
}

function parseList(value: string): string[] {
  if (!value) return [];
  return value.split(/[|;,]/).map((item) => item.trim()).filter(Boolean);
}

function toNumber(value: any): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const str = String(value).trim();
  if (!str) return 0;
  const parsed = Number(str);
  if (Number.isFinite(parsed)) return parsed;

  const lower = str.toLowerCase();
  if (lower.includes("strongly agree")) return 5;
  if (lower.includes("strongly disagree")) return 1;
  if (lower.includes("disagree")) return 2;
  if (lower.includes("agree")) return 4;
  if (lower.includes("neutral") || lower.includes("undecided") || lower.includes("maybe")) return 3;
  if (lower.includes("deep and nuanced")) return 5;
  if (lower.includes("good understanding") || lower.includes("good")) return 4;
  if (lower.includes("basic understanding") || lower.includes("basic")) return 3;
  if (lower.includes("little to no") || lower.includes("little")) return 2;
  if (lower.includes("no understanding") || lower.includes("none") || lower.includes("never")) return 1;
  if (lower.includes("very little understanding")) return 1;
  if (lower.includes("developing understanding")) return 3;
  if (lower.includes("excellent")) return 5;
  if (lower.includes("very good")) return 4;
  if (lower.includes("average")) return 3;
  if (lower.includes("below average")) return 2;
  if (lower.includes("poor")) return 1;

  return 0;
}

function parseFileBuffer(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("No sheet found in workbook.");
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error("Sheet is empty.");
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });
  return rows.map(normalizeRowKeys);
}

function mergeDatasets(
  preRows: Record<string, any>[],
  postRows: Record<string, any>[]
): { merged: SurveyResponse[]; matchedCount: number } {
  const preIdKeys = [
    "email", "mail", "fullname", "name",
    "1fullnameasyoupreferonthecertificate", "fullnameasyoupreferonthecertificate",
  ];

  let preKey = "";
  for (const key of preIdKeys) {
    const normalized = normalizeHeader(key);
    if (preRows.some((row) => row[normalized] !== undefined && String(row[normalized]).trim() !== "")) {
      preKey = normalized;
      break;
    }
  }

  let postKey = "";
  for (const key of preIdKeys) {
    const normalized = normalizeHeader(key);
    if (postRows.some((row) => row[normalized] !== undefined && String(row[normalized]).trim() !== "")) {
      postKey = normalized;
      break;
    }
  }

  if (!preKey || !postKey) {
    throw new Error("Could not find an email or name column to identify participants in both sheets.");
  }

  const preMap = new Map<string, Record<string, any>>();
  for (const row of preRows) {
    const id = String(row[preKey] || "").trim().toLowerCase();
    if (id) preMap.set(id, row);
  }

  const merged: SurveyResponse[] = [];
  let matchedCount = 0;

  for (const postRow of postRows) {
    const id = String(postRow[postKey] || "").trim().toLowerCase();
    if (!id) continue;

    const preRow = preMap.get(id);
    if (!preRow) continue;

    matchedCount += 1;

    let leadership = toNumber(getCell(postRow, ["leadership"]));
    let criticalThinking = toNumber(getCell(postRow, ["criticalthinking"]));
    let empathy = toNumber(getCell(postRow, ["empathy"]));
    let problemSolving = toNumber(getCell(postRow, ["problemsolving"]));
    let communication = toNumber(getCell(postRow, ["communication"]));
    let justiceUnderstanding = toNumber(getCell(postRow, ["justiceunderstanding"]));

    const q16Aliases = ["16whichofthefollowingdoyoufeelyoudevelopedthroughthisworkshop", "q16", "developedskills"];
    const q16Value = getCell(postRow, q16Aliases).toLowerCase();
    if (q16Value) {
      if (leadership === 0 && q16Value.includes("leadership")) leadership = 5;
      if (criticalThinking === 0 && (q16Value.includes("critical thinking") || q16Value.includes("criticalthinking"))) criticalThinking = 5;
      if (empathy === 0 && q16Value.includes("empathy")) empathy = 5;
      if (problemSolving === 0 && (q16Value.includes("problem solving") || q16Value.includes("problemsolving"))) problemSolving = 5;
      if (communication === 0 && q16Value.includes("communication")) communication = 5;
      if (justiceUnderstanding === 0 && (q16Value.includes("justice understanding") || q16Value.includes("justice"))) justiceUnderstanding = 5;
    }

    let facilitatorRating = toNumber(getCell(postRow, ["facilitatorrating"]));
    if (facilitatorRating === 0) {
      const gauri = toNumber(getCell(postRow, ["27howhelpfulandsupportivewerethefacilitatorsgauri15scale", "gauri"]));
      const vaishnavi = toNumber(getCell(postRow, ["271howhelpfulandsupportivewerethefacilitatorsvaishnavi15scale", "vaishnavi"]));
      const rohit = toNumber(getCell(postRow, ["272howhelpfulandsupportivewerethefacilitatorsrohit15scale", "rohit"]));
      const ratings = [gauri, vaishnavi, rohit].filter((r) => r > 0);
      if (ratings.length > 0) {
        facilitatorRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      }
    }

    merged.push({
      email: id,
      pre: {
        q5: {
          caste: toNumber(getCell(preRow, ["5howwouldyourateyourunderstandingofthefollowingidentitiescaste"])),
          gender: toNumber(getCell(preRow, ["5howwouldyourateyourunderstandingofthefollowingidentitiesgender"])),
          religion: toNumber(getCell(preRow, ["5howwouldyourateyourunderstandingofthefollowingidentitiesreligion"])),
        },
        q7: toNumber(getCell(preRow, ["7howeffectivedoyouthinkhandsonactivitybasedmethodscreativepedagogiesareincomparisontotraditionallecturebasedteaching"])),
        q8: toNumber(getCell(preRow, ["8howconfidentareyouinyourproblemsolvingskillsincludingyourabilitytoidentifyanalyseandresolvechallengesusingcriticalthinkingcreativityandlogicalreasoning"])),
        q11: toNumber(getCell(preRow, ["11howwillyoumarkyourlevelofsensitivitytocitizensissuesbeforeji1011low5high"])),
      },
      post: {
        q12: toNumber(getCell(postRow, ["12howwillyoumarkyourlevelofsensitivitytocitizensissuesafterji101"])),
        q14: {
          caste: toNumber(getCell(postRow, ["14howwouldyourateyourunderstandingofthefollowingidentitiesbeforeji101caste"])),
          gender: toNumber(getCell(postRow, ["14howwouldyourateyourunderstandingofthefollowingidentitiesbeforeji101gender"])),
          religion: toNumber(getCell(postRow, ["14howwouldyourateyourunderstandingofthefollowingidentitiesbeforeji101religion"])),
        },
        q15: {
          caste: toNumber(getCell(postRow, ["15howwouldyourateyourunderstandingofthefollowingidentitiesafterji101caste"])),
          gender: toNumber(getCell(postRow, ["15howwouldyourateyourunderstandingofthefollowingidentitiesafterji101gender"])),
          religion: toNumber(getCell(postRow, ["15howwouldyourateyourunderstandingofthefollowingidentitiesafterji101religion"])),
        },
        q18: toNumber(getCell(postRow, ["18towhatextenddidyouagreewiththestatementbeforetheworkshopthehandsonandactivitybasedmethodscreativepedagogiesweremoreeffectivethantraditionallectures"])),
        q19: toNumber(getCell(postRow, ["19towhatextenddoyouagreewiththestatementaftertheworkshopthehandsonandactivitybasedmethodscreativepedagogiesweremoreeffectivethantraditionallectures"])),
        q21: toNumber(getCell(postRow, ["21howconfidentwereyoubeforetheworkshopinyourproblemsolvingskillsincludingyourabilitytoidentifyanalyseandresolvechallengesusingcriticalthinkingcreativityandlogicalreasoning"])),
        q22: toNumber(getCell(postRow, ["22howconfidentareyounowaftertheworkshopinyourproblemsolvingskillsincludingyourabilitytoidentifyanalyseandresolvechallengesusingcriticalthinkingcreativityandlogicalreasoning"])),
        ideasHeard: toNumber(getCell(postRow, ["6towhatdegreedoyouagreewiththestatementifeltmyideaswereheardandconsideredbytheteam"])),
        respect: toNumber(getCell(postRow, ["6towhatdegreedoyouagreewiththestatementourteamrespectedandvalueddiverseperspectives"])),
        teamPreference: toNumber(getCell(postRow, ["6towhatdegreedoyouagreewiththestatementiwouldprefertodothisindividuallyratherthaninateam"])),
        strengths: parseList(getCell(postRow, ["7strengthsyourteamhadinworkingtogether"])),
        challenges: parseList(getCell(postRow, ["9whatwasonechallengeyourteamfacedhowdidyouworkthroughit"])),
        teamValues: parseList(getCell(postRow, ["10wereyourteamvaluesviolatedatanypointintime"])),
        visioningExercise: parseList(getCell(postRow, ["101doyouthinkvisioningexercisehelptheteamtounderstandwhatisteamsgoalbeforeidentifyingproblemstatement"])),
        clayActivity: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveclaybasedactivity"])),
        sixW2h: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveproblemsolving6w2h"])),
        riverOfLife: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivedrawingbasedactivityriveroflife"])),
        aiActivity: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveaibasedactivity"])),
        gameActivity: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivegamebasedactivitybingocheerstoconstitution"])),
        laptopActivity: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivelaptopbasedactivity"])),
        fieldActivity: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivefieldactivity"])),
        feelingsChart: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivefeelingschartactivity"])),
        caseStudy: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivecasestudyreadingactivity"])),
        interventionPlanning: toNumber(getCell(postRow, ["20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveinterventionplanning"])),
        facilitatorRating,
        safeLearningEnvironment: toNumber(getCell(postRow, ["28thefacilitatorscreatedasafeandengaginglearningenvironment"])),
        clearInstructions: toNumber(getCell(postRow, ["29instructionswerelargelyeasytofollownotconfusing"])),
        leadership,
        criticalThinking,
        empathy,
        problemSolving,
        communication,
        justiceUnderstanding,
        overallSatisfaction: toNumber(getCell(postRow, ["24onascaleof15howwouldyourateyouroverallexperienceofjusticeinnovation101"])),
        suggestions: parseList(getCell(postRow, ["30whatchangeswouldyourecommendtoanyofthefacilitatorsapproachorstylepleasefeelfreetowrite"])),
      },
    } as SurveyResponse);
  }

  return { merged, matchedCount };
}

export async function uploadPreWorkshop(workshopId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file was provided." };
  if (file.size === 0) return { success: false, error: "The uploaded file is empty." };

  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: Record<string, any>[];
  try {
    rows = parseFileBuffer(buffer);
  } catch (e: any) {
    return { success: false, error: `Failed to parse file: ${e.message}` };
  }

  if (rows.length === 0) return { success: false, error: "The sheet contains no data rows." };

  const preIdKeys = ["email", "mail", "fullname", "name", "1fullnameasyoupreferonthecertificate", "fullnameasyoupreferonthecertificate"];
  let preKey = "";
  for (const key of preIdKeys) {
    const normalized = normalizeHeader(key);
    if (rows.some((row) => row[normalized] !== undefined && String(row[normalized]).trim() !== "")) {
      preKey = normalized;
      break;
    }
  }
  if (!preKey) {
    return { success: false, error: "Could not find an email or name column to identify participants." };
  }

  await writeWorkshopFile(workshopId, "pre_responses.json", rows);
  await updateWorkshopStatus(workshopId, "uploaded", {
    preUploadedAt: new Date().toISOString(),
    preCount: rows.length,
=======
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
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  });

  await tryMerge(workshopId);

<<<<<<< HEAD
  return { success: true, count: rows.length };
}

export async function uploadPostWorkshop(workshopId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file was provided." };
  if (file.size === 0) return { success: false, error: "The uploaded file is empty." };

  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: Record<string, any>[];
  try {
    rows = parseFileBuffer(buffer);
  } catch (e: any) {
    return { success: false, error: `Failed to parse file: ${e.message}` };
  }

  if (rows.length === 0) return { success: false, error: "The sheet contains no data rows." };

  const preIdKeys = ["email", "mail", "fullname", "name", "1fullnameasyoupreferonthecertificate", "fullnameasyoupreferonthecertificate"];
  let postKey = "";
  for (const key of preIdKeys) {
    const normalized = normalizeHeader(key);
    if (rows.some((row) => row[normalized] !== undefined && String(row[normalized]).trim() !== "")) {
      postKey = normalized;
      break;
    }
  }
  if (!postKey) {
    return { success: false, error: "Could not find an email or name column to identify participants." };
  }

  await writeWorkshopFile(workshopId, "post_responses.json", rows);
  await updateWorkshopStatus(workshopId, "uploaded", {
    postUploadedAt: new Date().toISOString(),
    postCount: rows.length,
=======
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
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  });

  await tryMerge(workshopId);

<<<<<<< HEAD
  return { success: true, count: rows.length };
=======
  return { success: true, count: extracted.length };
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
}

async function tryMerge(workshopId: string) {
  const pre = await readWorkshopFile(workshopId, "pre_responses.json");
  const post = await readWorkshopFile(workshopId, "post_responses.json");
  if (!pre || !post) return;

<<<<<<< HEAD
  const { merged, matchedCount } = mergeDatasets(pre, post);
  await writeWorkshopFile(workshopId, "survey_responses.json", merged);
  await updateWorkshopStatus(workshopId, "uploaded", { matchedCount });
=======
  const merged = mergeDatasets(pre, post);
  await writeWorkshopFile(workshopId, "survey_responses.json", merged);
  await updateWorkshopStatus(workshopId, "uploaded", { matchedCount: merged.length });
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
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
