import type { DimensionMatch, ParticipantRecord, QuestionRef, Stage } from "@/types";
import { detectIdColumn, isNameColumn, looksLikePersonNameHeader } from "./question-matching";
import { getDimensionMap, getParticipantRecords, getFormData } from "./workshops";

export interface AnalyticsSource {
  responses: ParticipantRecord[];
  dimensions: DimensionMatch[];
  allQuestions: Array<{ stage: Stage; ref: QuestionRef }>;
}

export async function getAnalyticsSource(workshopId: string): Promise<AnalyticsSource> {
  const [formA, formB, formC, dimensionMap, responses] = await Promise.all([
    getFormData(workshopId, "a"),
    getFormData(workshopId, "b"),
    getFormData(workshopId, "c"),
    getDimensionMap(workshopId),
    getParticipantRecords(workshopId),
  ]);

  const allQuestions: Array<{ stage: Stage; ref: QuestionRef }> = [];
  const forms: Array<{ stage: Stage; headers: Record<string, string> | null; rows: Record<string, unknown>[] }> = [
    { stage: "a", headers: formA?.headers ?? null, rows: formA?.rows ?? [] },
    { stage: "b", headers: formB?.headers ?? null, rows: formB?.rows ?? [] },
    { stage: "c", headers: formC?.headers ?? null, rows: formC?.rows ?? [] },
  ];

  for (const form of forms) {
    if (!form.headers) continue;
    const headerKeys = Object.keys(form.headers);
    const idColumn = detectIdColumn(headerKeys, form.rows);
    for (const [key, text] of Object.entries(form.headers)) {
      if (!key || key === idColumn) continue;
      if (isNameColumn(key)) continue;
      const label = String(text ?? key).trim();
      if (looksLikePersonNameHeader(label) || looksLikePersonNameHeader(key.replace(/_/g, " "))) continue;
      allQuestions.push({ stage: form.stage, ref: { key, text: label || key } });
    }
  }

  return {
    responses,
    dimensions: dimensionMap ?? [],
    allQuestions,
  };
}
