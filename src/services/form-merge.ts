import type { AnswerValue, DimensionMatch, ParticipantRecord, Stage } from "@/types";
import type { WorkshopDataConfig } from "@/types/data-model";
import { deriveAnalysisModeFromStages, unavailableAnalyses } from "./analysis-capabilities";
import {
  detectIdColumn,
  extractQuestions,
  isNameColumn,
  isNumericValue,
  detectScaleMax,
  matchDimensionsForStages,
  parseAnswerValue,
} from "./question-matching";
import { catalogFromForm } from "./question-intelligence";
import {
  getFormData,
  saveDimensionMap,
  saveParticipantRecords,
  updateWorkshopStatus,
  getWorkshopDataConfig,
  saveWorkshopDataConfig,
} from "./workshops";

type SheetRow = Record<string, unknown>;

function participantHasRequiredStages(
  answers: ParticipantRecord["answers"],
  required: Stage[]
): boolean {
  return required.every((s) => Object.keys(answers[s] ?? {}).length > 0);
}

function indexByStage(
  rows: SheetRow[],
  idCol: string,
  questionRefs: { key: string }[],
  nameCol?: string
) {
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
}

function normalizeScales(records: ParticipantRecord[], dimensions: DimensionMatch[]) {
  const questionKeys = new Set<string>();
  for (const d of dimensions) {
    if (d.a) questionKeys.add(d.a.key);
    if (d.b) questionKeys.add(d.b.key);
    if (d.c) questionKeys.add(d.c.key);
  }

  for (const stage of ["a", "b", "c"] as const) {
    for (const qKey of questionKeys) {
      const values: number[] = [];
      for (const r of records) {
        const v = r.answers[stage]?.[qKey];
        if (isNumericValue(v)) values.push(v);
      }
      if (values.length === 0) continue;
      const scaleMax = detectScaleMax(values);
      if (scaleMax === 5) continue;
      const factor = 5 / scaleMax;
      for (const r of records) {
        const v = r.answers[stage]?.[qKey];
        if (isNumericValue(v)) {
          r.answers[stage][qKey] = Math.round(v * factor * 10) / 10;
        }
      }
    }
  }
}

function buildQuestionMappingsPreview(dimensions: DimensionMatch[]): WorkshopDataConfig["questionMappings"] {
  return dimensions.map((d) => ({
    topic: d.name,
    stages: {
      ...(d.a ? { a: d.a.text } : {}),
      ...(d.b ? { b: d.b.text } : {}),
      ...(d.c ? { c: d.c.text } : {}),
    },
  }));
}

export async function mergeWorkshopData(workshopId: string): Promise<{
  matchedCount: number;
  dimensions: DimensionMatch[];
  warnings: string[];
} | null> {
  const config = await getWorkshopDataConfig(workshopId);
  const presentStages: Stage[] = [];
  const stageMeta: Partial<
    Record<
      Stage,
      {
        rows: SheetRow[];
        headers: Record<string, string>;
        idCol: string;
        questions: ReturnType<typeof extractQuestions>;
        nameCol?: string;
      }
    >
  > = {};

  for (const stage of ["a", "b", "c"] as const) {
    const form = await getFormData(workshopId, stage);
    if (!form?.rows?.length) continue;
    const keys = Object.keys(form.headers);
    const idCol = detectIdColumn(keys, form.rows as SheetRow[]);
    if (!idCol) {
      return null;
    }
    const questions = extractQuestions(form.headers, idCol);
    if (questions.length === 0) continue;
    const nameCol = keys.find((k) => isNameColumn(k));
    presentStages.push(stage);
    stageMeta[stage] = {
      rows: form.rows as SheetRow[],
      headers: form.headers,
      idCol,
      questions,
      nameCol,
    };
  }

  if (presentStages.length === 0) return null;

  const mode = deriveAnalysisModeFromStages(presentStages);
  const warnings = [...config.warnings];

  if (presentStages.length === 1) {
    const stage = presentStages[0];
    const meta = stageMeta[stage]!;
    const { map, names } = indexByStage(meta.rows, meta.idCol, meta.questions, meta.nameCol);
    const records: ParticipantRecord[] = [];
    for (const [pid, answers] of map) {
      records.push({
        participantId: pid,
        name: names.get(pid) ?? null,
        answers: {
          a: stage === "a" ? answers : {},
          b: stage === "b" ? answers : {},
          c: stage === "c" ? answers : {},
        },
      });
    }
    if (records.length === 0) return null;

    const catalog = catalogFromForm(meta.headers, meta.rows, stage);
    await saveWorkshopDataConfig(workshopId, {
      ...config,
      analysisMode: "single",
      questions: catalog.questions,
      idColumnByStage: { [stage]: meta.idCol },
      questionMappings: [],
      warnings,
    });
    await saveDimensionMap(workshopId, []);
    await saveParticipantRecords(workshopId, records);
    await updateWorkshopStatus(workshopId, "uploaded", { matchedCount: records.length });
    return { matchedCount: records.length, dimensions: [], warnings };
  }

  const idCols = presentStages.map((s) => stageMeta[s]!.idCol);
  const idMismatch = new Set(idCols).size > 1;
  if (idMismatch) {
    warnings.push(
      "Participant identifier columns differ between forms; matching uses normalized ID values where possible."
    );
  }

  const stageQuestions: Partial<Record<Stage, ReturnType<typeof extractQuestions>>> = {};
  for (const s of presentStages) {
    stageQuestions[s] = stageMeta[s]!.questions;
  }

  const dimensions = matchDimensionsForStages(stageQuestions);
  if (dimensions.length === 0) {
    warnings.push("No matching questions were found across forms; cross-topic comparison may be limited.");
  }

  // Multi-form: include participants who answered every uploaded form (for fair comparison).
  const effectiveRequired = presentStages.length > 1 ? presentStages : presentStages;

  const stageMaps = Object.fromEntries(
    presentStages.map((s) => {
      const meta = stageMeta[s]!;
      return [s, indexByStage(meta.rows, meta.idCol, meta.questions, meta.nameCol)];
    })
  ) as Record<Stage, ReturnType<typeof indexByStage>>;

  const allIds = new Set<string>();
  for (const s of presentStages) {
    for (const pid of stageMaps[s].map.keys()) allIds.add(pid);
  }

  const buildRecords = (requireAllPresent: boolean) => {
    const out: ParticipantRecord[] = [];
    for (const pid of allIds) {
      const answers: ParticipantRecord["answers"] = { a: {}, b: {}, c: {} };
      let name: string | null = null;
      for (const stage of presentStages) {
        const { map, names } = stageMaps[stage];
        const stageAnswers = map.get(pid);
        if (stageAnswers) {
          answers[stage] = stageAnswers;
          if (!name) name = names.get(pid) ?? null;
        }
      }
      if (requireAllPresent && !participantHasRequiredStages(answers, effectiveRequired)) continue;
      if (!requireAllPresent && !presentStages.some((s) => Object.keys(answers[s] ?? {}).length > 0)) continue;
      out.push({ participantId: pid, name, answers });
    }
    return out;
  };

  let records = buildRecords(true);
  if (records.length === 0 && presentStages.length > 1) {
    warnings.push(
      "No participants completed every uploaded form; insights use all available responses per form (paired comparisons may be limited)."
    );
    records = buildRecords(false);
  }

  if (records.length === 0) return null;

  normalizeScales(records, dimensions);

  const allQuestions = presentStages.flatMap((s) => {
    const cat = catalogFromForm(stageMeta[s]!.headers, stageMeta[s]!.rows, s);
    return cat.questions;
  });

  const updatedConfig: WorkshopDataConfig = {
    ...config,
    analysisMode: mode,
    questions: allQuestions,
    idColumnByStage: Object.fromEntries(presentStages.map((s) => [s, stageMeta[s]!.idCol])),
    questionMappings: buildQuestionMappingsPreview(dimensions),
    warnings: [...warnings, ...unavailableAnalyses(mode)],
  };

  await saveWorkshopDataConfig(workshopId, updatedConfig);
  await saveDimensionMap(workshopId, dimensions);
  await saveParticipantRecords(workshopId, records);
  await updateWorkshopStatus(workshopId, "uploaded", { matchedCount: records.length });

  return { matchedCount: records.length, dimensions, warnings };
}
