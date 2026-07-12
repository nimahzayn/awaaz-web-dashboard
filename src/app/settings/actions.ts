"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import type { SurveyResponse } from "@/types";

const dataDir = path.join(process.cwd(), "src/data");

function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

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
  if (!value) {
    return [];
  }
  return value
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: any): number {
  if (value === undefined || value === null) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  const str = String(value).trim();
  if (!str) {
    return 0;
  }
  const parsed = Number(str);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  
  const lower = str.toLowerCase();
  
  // Likert Scale (1-5)
  if (lower.includes("strongly agree")) return 5;
  if (lower.includes("strongly disagree")) return 1;
  if (lower.includes("disagree")) return 2;
  if (lower.includes("agree")) return 4;
  if (lower.includes("neutral") || lower.includes("undecided") || lower.includes("maybe")) return 3;
  
  // Understanding level options
  if (lower.includes("deep and nuanced")) return 5;
  if (lower.includes("good understanding") || lower.includes("good")) return 4;
  if (lower.includes("basic understanding") || lower.includes("basic")) return 3;
  if (lower.includes("little to no") || lower.includes("little")) return 2;
  if (lower.includes("no understanding") || lower.includes("none") || lower.includes("never")) return 1;
  
  return 0;
}

function parseFileBuffer(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("No sheet found in workbook.");
  }
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error("Sheet is empty.");
  }
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });
  return rows.map(normalizeRowKeys);
}

function mergeDatasets(
  preRows: Record<string, any>[],
  postRows: Record<string, any>[]
): { merged: SurveyResponse[]; matchedCount: number } {
  const preIdKeys = [
    "email",
    "mail",
    "fullname",
    "name",
    "1fullnameasyoupreferonthecertificate",
    "fullnameasyoupreferonthecertificate",
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
    throw new Error("Could not find an email or name column (e.g., 'Email', 'Full Name') to identify participants in both sheets.");
  }
  
  const preMap = new Map<string, Record<string, any>>();
  for (const row of preRows) {
    const id = String(row[preKey] || "").trim().toLowerCase();
    if (id) {
      preMap.set(id, row);
    }
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
    let criticalThinking = toNumber(getCell(postRow, ["criticalthinking", "criticalThinking"]));
    let empathy = toNumber(getCell(postRow, ["empathy"]));
    let problemSolving = toNumber(getCell(postRow, ["problemsolving", "problemSolving"]));
    let communication = toNumber(getCell(postRow, ["communication"]));
    let justiceUnderstanding = toNumber(getCell(postRow, ["justiceunderstanding", "justiceUnderstanding"]));
    
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
    
    let facilitatorRating = toNumber(getCell(postRow, ["facilitatorrating", "facilitatorRating"]));
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
          caste: toNumber(getCell(preRow, ["pre_q5_caste", "q5caste", "q5Caste", "5howwouldyourateyourunderstandingofthefollowingidentitiescaste"])),
          gender: toNumber(getCell(preRow, ["pre_q5_gender", "q5gender", "q5Gender", "5howwouldyourateyourunderstandingofthefollowingidentitiesgender"])),
          religion: toNumber(getCell(preRow, ["pre_q5_religion", "q5religion", "q5Religion", "5howwouldyourateyourunderstandingofthefollowingidentitiesreligion"])),
        },
        q7: toNumber(getCell(preRow, ["pre_q7", "q7", "7howeffectivedoyouthinkhandsonactivitybasedmethodscreativepedagogiesareincomparisontotraditionallecturebasedteaching"])),
        q8: toNumber(getCell(preRow, ["pre_q8", "q8", "8howconfidentareyouinyourproblemsolvingskillsincludingyourabilitytoidentifyanalyseandresolvechallengesusingcriticalthinkingcreativityandlogicalreasoning"])),
        q11: toNumber(getCell(preRow, ["pre_q11", "q11", "11howwillyoumarkyourlevelofsensitivitytocitizensissuesbeforeji1011low5high"])),
      },
      post: {
        q12: toNumber(getCell(postRow, ["post_q12", "q12", "12howwillyoumarkyourlevelofsensitivitytocitizensissuesafterji101"])),
        q14: {
          caste: toNumber(getCell(postRow, ["post_q14_caste", "q14caste", "q14Caste", "14howwouldyourateyourunderstandingofthefollowingidentitiesbeforeji101caste"])),
          gender: toNumber(getCell(postRow, ["post_q14_gender", "q14gender", "q14Gender", "14howwouldyourateyourunderstandingofthefollowingidentitiesbeforeji101gender"])),
          religion: toNumber(getCell(postRow, ["post_q14_religion", "q14religion", "q14Religion", "14howwouldyourateyourunderstandingofthefollowingidentitiesbeforeji101religion"])),
        },
        q15: {
          caste: toNumber(getCell(postRow, ["post_q15_caste", "q15caste", "q15Caste", "15howwouldyourateyourunderstandingofthefollowingidentitiesafterji101caste"])),
          gender: toNumber(getCell(postRow, ["post_q15_gender", "q15gender", "q15Gender", "15howwouldyourateyourunderstandingofthefollowingidentitiesafterji101gender"])),
          religion: toNumber(getCell(postRow, ["post_q15_religion", "q15religion", "q15Religion", "15howwouldyourateyourunderstandingofthefollowingidentitiesafterji101religion"])),
        },
        q18: toNumber(getCell(postRow, ["post_q18", "q18", "18towhatextenddidyouagreewiththestatementbeforetheworkshopthehandsonandactivitybasedmethodscreativepedagogiesweremoreeffectivethantraditionallectures"])),
        q19: toNumber(getCell(postRow, ["post_q19", "q19", "19towhatextenddoyouagreewiththestatementaftertheworkshopthehandsonandactivitybasedmethodscreativepedagogiesweremoreeffectivethantraditionallectures"])),
        q21: toNumber(getCell(postRow, ["post_q21", "q21", "21howconfidentwereyoubeforetheworkshopinyourproblemsolvingskillsincludingyourabilitytoidentifyanalyseandresolvechallengesusingcriticalthinkingcreativityandlogicalreasoning"])),
        q22: toNumber(getCell(postRow, ["post_q22", "q22", "22howconfidentareyounowaftertheworkshopinyourproblemsolvingskillsincludingyourabilitytoidentifyanalyseandresolvechallengesusingcriticalthinkingcreativityandlogicalreasoning"])),
        ideasHeard: toNumber(getCell(postRow, ["ideasheard", "ideasHeard", "6towhatdegreedoyouagreewiththestatementifeltmyideaswereheardandconsideredbytheteam"])),
        respect: toNumber(getCell(postRow, ["respect", "6towhatdegreedoyouagreewiththestatementourteamrespectedandvalueddiverseperspectives"])),
        teamPreference: toNumber(getCell(postRow, ["teampreference", "teamPreference", "6towhatdegreedoyouagreewiththestatementiwouldprefertodothisindividuallyratherthaninateam"])),
        strengths: parseList(getCell(postRow, ["strengths", "7strengthsyourteamhadinworkingtogether"])),
        challenges: parseList(getCell(postRow, ["challenges", "9whatwasonechallengeyourteamfacedhowdidyouworkthroughit"])),
        teamValues: parseList(getCell(postRow, ["teamvalues", "teamValues", "10wereyourteamvaluesviolatedatanypointintime"])),
        visioningExercise: parseList(getCell(postRow, ["visioningexercise", "visioningExercise", "101doyouthinkvisioningexercisehelptheteamtounderstandwhatisteamsgoalbeforeidentifyingproblemstatement"])),
        clayActivity: toNumber(getCell(postRow, ["clayactivity", "clayActivity", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveclaybasedactivity"])),
        sixW2h: toNumber(getCell(postRow, ["sixw2h", "sixW2h", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveproblemsolving6w2h"])),
        riverOfLife: toNumber(getCell(postRow, ["riveroflife", "riverOfLife", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivedrawingbasedactivityriveroflife"])),
        aiActivity: toNumber(getCell(postRow, ["aiactivity", "aiActivity", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveaibasedactivity"])),
        gameActivity: toNumber(getCell(postRow, ["gameactivity", "gameActivity", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivegamebasedactivitybingocheerstoconstitution"])),
        laptopActivity: toNumber(getCell(postRow, ["laptopactivity", "laptopActivity", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivelaptopbasedactivity"])),
        fieldActivity: toNumber(getCell(postRow, ["fieldactivity", "fieldActivity", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivefieldactivity"])),
        feelingsChart: toNumber(getCell(postRow, ["feelingschart", "feelingsChart", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivefeelingschartactivity"])),
        caseStudy: toNumber(getCell(postRow, ["casestudy", "caseStudy", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectivecasestudyreadingactivity"])),
        interventionPlanning: toNumber(getCell(postRow, ["interventionplanning", "interventionPlanning", "20whichactivitydoyouthinkwasthemosteffectiveinthisshift5beingmosteffectiveand1beingleasteffectiveinterventionplanning"])),
        facilitatorRating,
        safeLearningEnvironment: toNumber(getCell(postRow, ["safelearningenvironment", "safeLearningEnvironment", "28thefacilitatorscreatedasafeandengaginglearningenvironment"])),
        clearInstructions: toNumber(getCell(postRow, ["clearinstructions", "clearInstructions", "29instructionswerelargelyeasytofollownotconfusing"])),
        leadership,
        criticalThinking,
        empathy,
        problemSolving,
        communication,
        justiceUnderstanding,
        overallSatisfaction: toNumber(getCell(postRow, ["overallsatisfaction", "overallSatisfaction", "24onascaleof15howwouldyourateyouroverallexperienceofjusticeinnovation101"])),
        suggestions: parseList(getCell(postRow, ["suggestions", "30whatchangeswouldyourecommendtoanyofthefacilitatorsapproachorstylepleasefeelfreetowrite"])),
      },
    });
  }
  
  return { merged, matchedCount };
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  count?: number;
  matchedCount?: number;
}

export async function uploadPreWorkshop(formData: FormData): Promise<ActionResponse> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, message: "No file was provided." };
    }
    if (file.size === 0) {
      return { success: false, message: "The uploaded file is empty." };
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: Record<string, any>[];
    try {
      rows = parseFileBuffer(buffer);
    } catch (e: any) {
      return { success: false, message: `Failed to parse file: ${e.message}` };
    }
    
    if (rows.length === 0) {
      return { success: false, message: "The sheet contains no data rows." };
    }
    
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
      return { success: false, message: "Could not find an email or name column (e.g., 'Email', 'Full Name') to identify participants." };
    }
    
    ensureDataDirectory();
    fs.writeFileSync(path.join(dataDir, "pre_responses.json"), JSON.stringify(rows, null, 2));
    
    let matchedCount = 0;
    const postPath = path.join(dataDir, "post_responses.json");
    if (fs.existsSync(postPath)) {
      const postRows = JSON.parse(fs.readFileSync(postPath, "utf-8"));
      const result = mergeDatasets(rows, postRows);
      fs.writeFileSync(path.join(dataDir, "survey_responses.json"), JSON.stringify(result.merged, null, 2));
      matchedCount = result.matchedCount;
    }
    
    revalidatePath("/");
    return { success: true, message: `Pre-Workshop responses uploaded successfully. Found ${rows.length} rows.`, count: rows.length, matchedCount };
  } catch (error: any) {
    return { success: false, message: `Server error: ${error.message}` };
  }
}

export async function uploadPostWorkshop(formData: FormData): Promise<ActionResponse> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, message: "No file was provided." };
    }
    if (file.size === 0) {
      return { success: false, message: "The uploaded file is empty." };
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: Record<string, any>[];
    try {
      rows = parseFileBuffer(buffer);
    } catch (e: any) {
      return { success: false, message: `Failed to parse file: ${e.message}` };
    }
    
    if (rows.length === 0) {
      return { success: false, message: "The sheet contains no data rows." };
    }
    
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
      return { success: false, message: "Could not find an email or name column (e.g., 'Email', 'Full Name') to identify participants." };
    }
    
    ensureDataDirectory();
    fs.writeFileSync(path.join(dataDir, "post_responses.json"), JSON.stringify(rows, null, 2));
    
    let matchedCount = 0;
    const prePath = path.join(dataDir, "pre_responses.json");
    if (fs.existsSync(prePath)) {
      const preRows = JSON.parse(fs.readFileSync(prePath, "utf-8"));
      const result = mergeDatasets(preRows, rows);
      fs.writeFileSync(path.join(dataDir, "survey_responses.json"), JSON.stringify(result.merged, null, 2));
      matchedCount = result.matchedCount;
    }
    
    revalidatePath("/");
    return { success: true, message: `Post-Workshop responses uploaded successfully. Found ${rows.length} rows.`, count: rows.length, matchedCount };
  } catch (error: any) {
    return { success: false, message: `Server error: ${error.message}` };
  }
}

export async function getUploadStatus() {
  try {
    const prePath = path.join(dataDir, "pre_responses.json");
    const postPath = path.join(dataDir, "post_responses.json");
    const mergedPath = path.join(dataDir, "survey_responses.json");
    
    const status = {
      preUploaded: false,
      preCount: 0,
      preTime: "",
      postUploaded: false,
      postCount: 0,
      postTime: "",
      mergedCount: 0,
    };
    
    if (fs.existsSync(prePath)) {
      const stat = fs.statSync(prePath);
      const preRows = JSON.parse(fs.readFileSync(prePath, "utf-8"));
      status.preUploaded = true;
      status.preCount = preRows.length;
      status.preTime = stat.mtime.toLocaleString();
    }
    
    if (fs.existsSync(postPath)) {
      const stat = fs.statSync(postPath);
      const postRows = JSON.parse(fs.readFileSync(postPath, "utf-8"));
      status.postUploaded = true;
      status.postCount = postRows.length;
      status.postTime = stat.mtime.toLocaleString();
    }
    
    if (fs.existsSync(mergedPath)) {
      const mergedRows = JSON.parse(fs.readFileSync(mergedPath, "utf-8"));
      status.mergedCount = mergedRows.length;
    }
    
    return status;
  } catch (error) {
    return {
      preUploaded: false,
      preCount: 0,
      preTime: "",
      postUploaded: false,
      postCount: 0,
      postTime: "",
      mergedCount: 0,
    };
  }
}
