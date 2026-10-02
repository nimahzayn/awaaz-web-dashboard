"use server";

import type { FormRole, QuestionCategory, QuestionType, WorkshopDataConfig } from "@/types/data-model";
import { roleToStage } from "@/types/data-model";
import { rebuildConfigFromSources } from "./analysis-capabilities";
import { mergeWorkshopData } from "./form-merge";
import { catalogFromForm, applyQuestionOverrides, summarizeCategories, summarizeQuestionTypes } from "./question-intelligence";
import { detectIdColumn, matchDimensionsForStages } from "./question-matching";
import {
  applyFormCount,
  ensureEmptyDataConfigIfMissing,
  getFormData,
  getWorkshopDataConfig,
  saveFormData,
  saveWorkshopDataConfig,
  updateWorkshopStatus,
  workshopHasData,
} from "./workshops";
import { parseSheetData } from "./workshop-actions";

export async function setWorkshopFormCount(workshopId: string, formCount: 1 | 2 | 3) {
  const config = await applyFormCount(workshopId, formCount);
  return { success: true, config };
}

export async function setFormRole(workshopId: string, slotIndex: number, role: FormRole) {
  const config = await getWorkshopDataConfig(workshopId);
  const sources = config.sources.map((s) =>
    s.slotIndex === slotIndex ? { ...s, role, stage: roleToStage(role) } : s
  );
  const roleStages = sources.filter((s) => s.role).map((s) => s.stage);
  const duplicateStage = roleStages.length !== new Set(roleStages).size;
  const warnings = duplicateStage
    ? [
        ...config.warnings.filter((w) => !w.includes("same workshop stage")),
        "Two forms map to the same workshop stage; the latest upload for that stage will be used.",
      ]
    : config.warnings;

  const count = config.formCount === 0 ? 1 : config.formCount;
  const rebuilt = rebuildConfigFromSources(count, sources);
  const next: WorkshopDataConfig = { ...config, sources, ...rebuilt, warnings, confirmedAt: null };
  await saveWorkshopDataConfig(workshopId, next);
  return { success: true, config: next, duplicateStage };
}

export async function uploadWorkshopFormSlot(
  workshopId: string,
  slotIndex: number,
  formData: FormData
) {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file was provided." };

  const config = await getWorkshopDataConfig(workshopId);
  const source = config.sources.find((s) => s.slotIndex === slotIndex);
  if (!source) return { success: false, error: "Invalid form slot." };

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed: { headers: Record<string, string>; rows: Record<string, unknown>[] };
  try {
    parsed = await parseSheetData(buffer.toString("base64"));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }

  if (parsed.rows.length === 0) return { success: false, error: "The sheet contains no data rows." };

  const headerKeys = Object.keys(parsed.headers);
  const idColumn = detectIdColumn(headerKeys, parsed.rows as Record<string, any>[]);
  if (!idColumn) {
    return { success: false, error: "Could not find a participant identifier column (email, ID, or name)." };
  }

  let stage = source.stage;
  if (source.role) {
    stage = roleToStage(source.role);
  }

  await saveFormData(workshopId, stage, parsed.rows as Record<string, any>[], parsed.headers);

  const catalog = catalogFromForm(parsed.headers, parsed.rows, stage);
  const otherQuestions = config.questions.filter((q) => q.stage !== stage);
  const sources = config.sources.map((s) =>
    s.slotIndex === slotIndex
      ? {
          ...s,
          stage,
          fileName: file.name,
          responseCount: parsed.rows.length,
          questionCount: catalog.questions.length,
        }
      : s
  );

  const count = config.formCount === 0 ? 1 : config.formCount;
  const rebuilt = rebuildConfigFromSources(count, sources);
  const stageQuestions: Partial<Record<"a" | "b" | "c", { key: string; text: string }[]>> = {};
  for (const s of ["a", "b", "c"] as const) {
    const form = await getFormData(workshopId, s);
    if (!form) continue;
    const keys = Object.keys(form.headers);
    const id = detectIdColumn(keys, form.rows as Record<string, any>[]);
    if (!id) continue;
    const { extractQuestions } = await import("./question-matching");
    stageQuestions[s] = extractQuestions(form.headers, id);
  }
  const previewDimensions = matchDimensionsForStages(stageQuestions);

  const next: WorkshopDataConfig = {
    ...config,
    sources,
    questions: [...otherQuestions, ...catalog.questions],
    idColumnByStage: { ...config.idColumnByStage, [stage]: idColumn },
    questionMappings: previewDimensions.map((d) => ({
      topic: d.name,
      stages: {
        ...(d.a ? { a: d.a.text } : {}),
        ...(d.b ? { b: d.b.text } : {}),
        ...(d.c ? { c: d.c.text } : {}),
      },
    })),
    ...rebuilt,
    confirmedAt: null,
  };
  await saveWorkshopDataConfig(workshopId, next);

  const extra: Record<string, string | number> = {};
  extra[`${stage}UploadedAt`] = new Date().toISOString();
  extra[`${stage}Count`] = parsed.rows.length;
  await updateWorkshopStatus(workshopId, "uploaded", extra as any);

  return { success: true, count: parsed.rows.length, stage, config: next };
}

export async function getWorkshopDataPreview(workshopId: string) {
  const [config, status] = await Promise.all([getWorkshopDataConfig(workshopId), workshopHasData(workshopId)]);

  const forms = await Promise.all(
    (["a", "b", "c"] as const).map(async (stage) => {
      const data = await getFormData(workshopId, stage);
      if (!data) return null;
      return { stage, ...data };
    })
  );

  const questionTypes = summarizeQuestionTypes(config.questions);
  const categories = summarizeCategories(config.questions);

  const idWarnings: string[] = [];
  const presentIdCols = Object.entries(config.idColumnByStage).filter(([, v]) => v);
  if (presentIdCols.length > 1) {
    const unique = new Set(presentIdCols.map(([, v]) => v));
    if (unique.size > 1) {
      idWarnings.push(
        "These forms use different identifier column names; matching relies on comparable participant IDs across files."
      );
    }
  }
  if (config.formCount > 1 && presentIdCols.length < Math.min(config.formCount, 3)) {
    idWarnings.push(
      "Some forms do not yet have a detected participant identifier, so individual-level comparison may not be possible."
    );
  }

  return {
    config,
    status,
    questionTypes,
    categories,
    warnings: [...config.warnings, ...idWarnings],
    forms: forms.filter(Boolean),
  };
}

export async function updateQuestionClassifications(
  workshopId: string,
  overrides: Array<{ key: string; stage: "a" | "b" | "c"; questionType?: QuestionType; category?: QuestionCategory }>
) {
  const config = await getWorkshopDataConfig(workshopId);
  const questions = applyQuestionOverrides(config.questions, overrides);
  await saveWorkshopDataConfig(workshopId, { ...config, questions, confirmedAt: null });
  return { success: true };
}

export async function confirmDataSetup(workshopId: string) {
  const config = await getWorkshopDataConfig(workshopId);
  await saveWorkshopDataConfig(workshopId, {
    ...config,
    confirmedAt: new Date().toISOString(),
  });
  return { success: true };
}

export async function generateWorkshopAnalysis(workshopId: string) {
  const config = await getWorkshopDataConfig(workshopId);
  const status = await workshopHasData(workshopId);

  const requiredStages = new Set(
    config.sources.filter((s) => s.role || config.formCount === 1).map((s) => s.stage)
  );
  if (config.formCount === 1 && !status.a && !status.b && !status.c) {
    return { success: false, error: "Upload a survey file before generating analysis." };
  }
  if (config.formCount > 1) {
    for (const stage of requiredStages) {
      const has =
        (stage === "a" && status.a) || (stage === "b" && status.b) || (stage === "c" && status.c);
      if (!has) {
        return { success: false, error: "Upload all selected forms and choose what each form represents." };
      }
    }
  }

  if (!config.confirmedAt) {
    return { success: false, error: "Review and confirm your data mappings on the Add Data page first." };
  }

  try {
    const mergeResult = await mergeWorkshopData(workshopId);
    if (!mergeResult) {
      return {
        success: false,
        error:
          "Could not merge participant responses. Check matching identifier columns and overlapping participants.",
      };
    }

    const { computeAnalytics } = await import("./analytics");
    const analytics = await computeAnalytics(workshopId);
    const { saveAnalytics } = await import("./workshops");
    await saveAnalytics(workshopId, analytics);
    await updateWorkshopStatus(workshopId, "analyzed", {
      analyzedAt: new Date().toISOString(),
    });
    return { success: true, warnings: mergeResult.warnings };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateWorkshopAnalysis failed:", err);
    return { success: false, error: `Analysis generation failed: ${message}` };
  }
}

export async function ensureDefaultDataConfig(workshopId: string) {
  return ensureEmptyDataConfigIfMissing(workshopId);
}
