import { NextResponse } from "next/server";
import { generateWorkshopAnalysis } from "@/services/generate-workshop-analysis";

/** Large workshops can take 1–2 minutes to merge and compute. */
export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: workshopId } = await context.params;

  try {
    const result = await generateWorkshopAnalysis(workshopId);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-analysis API failed:", err);
    return NextResponse.json(
      { success: false, error: message || "Analysis generation failed." },
      { status: 500 }
    );
  }
}
