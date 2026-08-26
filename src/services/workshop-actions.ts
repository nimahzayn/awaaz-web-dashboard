"use server";

import * as XLSX from "xlsx";
import type { AnswerValue, DimensionMatch, Stage } from "@/types";
import {
  normalizeHeader,
  detectIdColumn,
  extractQuestions,
  matchDimensions,
  parseAnswerValue,
  isNumericValue,
  detectScaleMax,
  isNameColumn,
} from "./question-matching";
import {
  saveFormData,
  getFormData,
  saveDimensionMap,
  saveParticipantRecords,
  updateWorkshopStatus,
  workshopHasData,
  deleteWorkshop as deleteWorkshopFromStore,
} from "./workshops";

type SheetRow = Record<string, any>;

function parseFileBuffer(buffer: Buffer): { headers: Record<string, string>; rows: SheetRow[] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("No sheet found in workbook.");
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error("Sheet is empty.");

  const matrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
  if (matrix.length === 0) throw new Error("Sheet is empty.");

  const rawHeaders = (matrix[0] as any[]).map((h) => String(h ?? ""));
  const headers: Record<string, string> = {};
  for (const h of rawHeaders) {
    const key = normalizeHeader(h);
    if (key && !headers[key]) headers[key] = h;
  }

  const rows: SheetRow[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const row: SheetRow = {};
    let hasValue = false;
    for (let j = 0; j < rawHeaders.length; j++) {
      const key = normalizeHeader(rawHeaders[j]);
      if (!key) continue;
      const value = matrix[i][j];
      row[key] = value;
      if (value !== undefined && String(value).trim() !== "") hasValue = true;
    }
    if (hasValue) rows.push(row);
  }

  return { headers, rows };
}

async function uploadForm(
  stage: Stage,
  stageLabel: string,
  workshopId: string,
  formData: FormData
) {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file was provided." };
  if (file.size === 0) return { success: false, error: "The uploaded file is empty." };

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed: { headers: Record<string, string>; rows: SheetRow[] };
  try {
    parsed = parseFileBuffer(buffer);
  } catch (e: any) {
    return { success: false, error: `Failed to parse file: ${e.message}` };
  }

  if (parsed.rows.length === 0) return { success: false, error: "The sheet contains no data rows." };

  const headerKeys = Object.keys(parsed.headers);
  const idColumn = detectIdColumn(headerKeys, parsed.rows);
  if (!idColumn) {
    return { success: false, error: `Could not find an email or name column in the ${stageLabel} file.` };
  }

  await saveFormData(workshopId, stage, parsed.rows, parsed.headers);

  const extra: Record<string, any> = {};
  extra[`${stage}UploadedAt`] = new Date().toISOString();
  extra[`${stage}Count`] = parsed.rows.length;
  await updateWorkshopStatus(workshopId, "uploaded", extra as any);

  await tryMerge(workshopId);

  return { success: true, count: parsed.rows.length };
}

export async function uploadFormA(workshopId: string, formData: FormData) {
  return uploadForm("a", "Form A", workshopId, formData);
}

export async function uploadFormB(workshopId: string, formData: FormData) {
  return uploadForm("b", "Form B", workshopId, formData);
}

export async function uploadFormC(workshopId: string, formData: FormData) {
  return uploadForm("c", "Form C", workshopId, formData);
}

interface ParticipantAnswers {
  participantId: string;
  name: string | null;
  answers: { a: Record<string, AnswerValue>; b: Record<string, AnswerValue>; c: Record<string, AnswerValue> };
}

async function tryMerge(workshopId: string): Promise<{ matchedCount: number; dimensions: DimensionMatch[] } | null> {
  const formA = await getFormData(workshopId, "a");
  const formB = await getFormData(workshopId, "b");
  const formC = await getFormData(workshopId, "c");
  if (!formA || !formB || !formC) return null;

  const keysA = Object.keys(formA.headers);
  const keysB = Object.keys(formB.headers);
  const keysC = Object.keys(formC.headers);

  const idA = detectIdColumn(keysA, formA.rows);
  const idB = detectIdColumn(keysB, formB.rows);
  const idC = detectIdColumn(keysC, formC.rows);
  if (!idA || !idB || !idC) return null;

  const questionsA = extractQuestions(formA.headers, idA);
  const questionsB = extractQuestions(formB.headers, idB);
  const questionsC = extractQuestions(formC.headers, idC);
  if (questionsA.length === 0 || questionsB.length === 0 || questionsC.length === 0) return null;

  const dimensions = matchDimensions(questionsA, questionsB, questionsC);
  if (dimensions.length === 0) return null;

  const nameAHeader = keysA.find((k) => isNameColumn(k));
  const nameBHeader = keysB.find((k) => isNameColumn(k));

  const indexByStage = (
    rows: SheetRow[],
    idCol: string,
    questionRefs: { key: string }[],
    nameCol?: string
  ) => {
    const qKeys = new Set(questionRefs.map((q) => q.key));
    const map = new Map<string, Record<string, AnswerValue>>();
    const names = new Map<string, string | null>();
    for (const row of rows) {
      const pid = String(row[idCol] ?? "").trim().toLowerCase();
      if (!pid) continue;
      const answers: Record<string, AnswerValue> = {};
      for (const key of Object.keys(row)) {
        if (!qKeys.has(key)) continue;
        answers[key] = parseAnswerValue(row[key]);
      }
      map.set(pid, answers);
      names.set(pid, nameCol ? (String(row[nameCol] ?? "").trim() || null) : null);
    }
    return { map, names };
  };

  const { map: answersAMap, names: namesA } = indexByStage(formA.rows, idA, questionsA, nameAHeader);
  const { map: answersBMap, names: namesB } = indexByStage(formB.rows, idB, questionsB, nameBHeader);
  const { map: answersCMap } = indexByStage(formC.rows, idC, questionsC);

  const allIds = new Set<string>([...answersAMap.keys(), ...answersBMap.keys(), ...answersCMap.keys()]);
  const records: ParticipantAnswers[] = [];

  for (const pid of allIds) {
    const a = answersAMap.get(pid);
    const b = answersBMap.get(pid);
    const c = answersCMap.get(pid);
    if (!a || !b || !c) continue;

    const rawName =
      (nameAHeader ? namesA.get(pid) ?? "" : "") ||
      (nameBHeader ? namesB.get(pid) ?? "" : "");

    records.push({
      participantId: pid,
      name: rawName || null,
      answers: { a, b, c },
    });
  }

  if (records.length === 0) return null;

  normalizeScales(records, dimensions);

  await saveDimensionMap(workshopId, dimensions);
  await saveParticipantRecords(workshopId, records);
  await updateWorkshopStatus(workshopId, "uploaded", { matchedCount: records.length });

  return { matchedCount: records.length, dimensions };
}

function normalizeScales(
  records: ParticipantAnswers[],
  dimensions: DimensionMatch[]
) {
  const questionKeys = new Set<string>();
  for (const d of dimensions) {
    questionKeys.add(d.a.key);
    questionKeys.add(d.b.key);
    questionKeys.add(d.c.key);
  }

  for (const stage of ["a", "b", "c"] as const) {
    for (const qKey of questionKeys) {
      const values: number[] = [];
      for (const r of records) {
        const v = r.answers[stage][qKey];
        if (isNumericValue(v)) values.push(v);
      }
      if (values.length === 0) continue;
      const scaleMax = detectScaleMax(values);
      if (scaleMax === 5) continue;
      const factor = 5 / scaleMax;
      for (const r of records) {
        const v = r.answers[stage][qKey];
        if (isNumericValue(v)) r.answers[stage][qKey] = Math.round(v * factor * 10) / 10;
      }
    }
  }
}

export async function generateAnalysis(workshopId: string) {
  const status = await workshopHasData(workshopId);
  if (!status.a || !status.b || !status.c) {
    return { success: false, error: "All three forms (A, B, and C) must be uploaded first." };
  }

  try {
    const mergeResult = await tryMerge(workshopId);
    if (!mergeResult) {
      return {
        success: false,
        error:
          "Could not match participants and questions across the three forms. Check that the same participants appear in each file and that the questions correspond.",
      };
    }

    const { computeAnalytics } = await import("./analytics");
    const analytics = await computeAnalytics(workshopId);
    const { saveAnalytics } = await import("./workshops");
    await saveAnalytics(workshopId, analytics);
    await updateWorkshopStatus(workshopId, "analyzed", {
      analyzedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateAnalysis failed:", err);
    return { success: false, error: `Analysis generation failed: ${message}` };
  }
}

export async function deleteWorkshop(workshopId: string) {
  await deleteWorkshopFromStore(workshopId);
  return { success: true };
}

export async function parseSheetData(base64Content: string) {
  try {
    return parseFileBuffer(Buffer.from(base64Content, "base64"));
  } catch (e: any) {
    throw new Error(`Failed to parse file: ${e?.message ?? e}`);
  }
}
