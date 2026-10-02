import { NextResponse } from "next/server";
import { uploadFormA, uploadFormB, uploadFormC, type FormUploadResult } from "@/services/workshop-actions";

const STAGES = {
  a: uploadFormA,
  b: uploadFormB,
  c: uploadFormC,
} as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: workshopId } = await context.params;
  const stage = new URL(request.url).searchParams.get("stage");

  if (stage !== "a" && stage !== "b" && stage !== "c") {
    return NextResponse.json(
      { success: false, error: "Invalid form stage. Use a, b, or c." } satisfies FormUploadResult,
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not read upload data." } satisfies FormUploadResult,
      { status: 400 }
    );
  }

  try {
    const result = await STAGES[stage](workshopId, formData);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Form upload failed:", err);
    return NextResponse.json(
      { success: false, error: message || "Upload failed." } satisfies FormUploadResult,
      { status: 500 }
    );
  }
}
