import { revalidatePath } from "next/cache";
import { computeAnalytics } from "./analytics";
import { mergeWorkshopData } from "./form-merge";
import { saveAnalytics, updateWorkshopStatus, workshopHasData } from "./workshops";

function revalidateWorkshopViews(workshopId: string) {
  const base = `/workshops/${workshopId}`;
  revalidatePath(`${base}/settings`);
  revalidatePath(`${base}/overview`);
  revalidatePath(`${base}/insights`);
  revalidatePath(`${base}/impact-report`);
}

export async function generateWorkshopAnalysis(workshopId: string): Promise<{
  success: boolean;
  error?: string;
  warnings?: string[];
}> {
  const status = await workshopHasData(workshopId);
  if (!status.a && !status.b && !status.c) {
    return { success: false, error: "Upload at least one survey form (A, B, or C) first." };
  }

  try {
    const mergeResult = await mergeWorkshopData(workshopId);
    if (!mergeResult) {
      return {
        success: false,
        error:
          "Could not prepare participant data. Check identifier columns and overlapping participants across uploaded forms.",
      };
    }

    const geminiConfigured = Boolean(
      process.env.GEMINI_API_KEY?.trim() ||
        process.env.GOOGLE_API_KEY?.trim() ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
    );
    if (process.env.NODE_ENV === "development") {
      console.log("[generate-analysis] Gemini configured:", geminiConfigured);
    }

    const analytics = await computeAnalytics(workshopId);
    await saveAnalytics(workshopId, analytics);
    await updateWorkshopStatus(workshopId, "analyzed", {
      analyzedAt: new Date().toISOString(),
    });

    try {
      revalidateWorkshopViews(workshopId);
    } catch (revalErr) {
      console.warn("generateWorkshopAnalysis: revalidatePath skipped", revalErr);
    }

    const warnings = [...new Set(mergeResult.warnings)];
    return { success: true, warnings };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generateWorkshopAnalysis failed:", err);
    return { success: false, error: `Analysis generation failed: ${message}` };
  }
}
