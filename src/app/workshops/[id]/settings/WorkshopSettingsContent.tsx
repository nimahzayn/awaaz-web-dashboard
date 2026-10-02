"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteWorkshop } from "@/services/workshop-actions";
import { Upload, Loader2, Sparkles, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import type { Workshop } from "@/types";
import Link from "next/link";

interface DataStatus {
  a: boolean;
  b: boolean;
  c: boolean;
  analysis: boolean;
  aCount: number;
  bCount: number;
  cCount: number;
  matchedCount: number;
}

type FormStage = "a" | "b" | "c";

interface FormCardProps {
  workshopId: string;
  stage: FormStage;
  title: string;
  subtitle: string;
  uploaded: boolean;
  count: number;
  onUploaded: () => void;
}

function UploadFormCard({
  workshopId,
  stage,
  title,
  subtitle,
  uploaded,
  count,
  onUploaded,
}: FormCardProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(`/api/workshops/${workshopId}/upload?stage=${stage}`, {
        method: "POST",
        body: fd,
      });
      let data: { success?: boolean; error?: string };
      try {
        data = (await res.json()) as { success?: boolean; error?: string };
      } catch {
        data = { success: false, error: res.statusText || "Upload failed." };
      }
      if (!res.ok || !data.success) {
        setError(data.error ?? "Upload failed. Check the file format and try again.");
        return;
      }
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {uploaded ? (
            <>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#44E6AD]">
                <CheckCircle2 className="h-3 w-3" />
                {count} responses uploaded
              </p>
              <p className="text-[10px] text-muted-foreground">{subtitle}</p>
            </>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle} · Not uploaded yet</p>
          )}
        </div>
        {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <label className={`flex cursor-pointer items-center gap-3 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
        <input
          type="file"
          accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : uploaded ? "Replace file" : "Upload CSV or XLSX"}
        </div>
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function WorkshopSettingsContent({ workshop, dataStatus }: { workshop: Workshop; dataStatus: DataStatus }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  function refreshAfterUpload() {
    router.refresh();
  }

  async function handleGenerate() {
    setGenerateError(null);
    setGenerateSuccess(null);
    setGenerating(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 4 * 60 * 1000);
      const res = await fetch(`/api/workshops/${workshop.id}/generate-analysis`, {
        method: "POST",
        cache: "no-store",
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeout));
      let data: { success?: boolean; error?: string; warnings?: string[] };
      try {
        data = (await res.json()) as { success?: boolean; error?: string; warnings?: string[] };
      } catch {
        data = { success: false, error: res.statusText || "Analysis request failed." };
      }
      if (!res.ok || !data.success) {
        setGenerateError(data.error ?? "Could not generate analysis. Check your survey files and try again.");
        return;
      }
      const warnNote =
        data.warnings?.length ? ` (${data.warnings.length} note${data.warnings.length > 1 ? "s" : ""} in logs)` : "";
      setGenerateSuccess(`Analysis saved. Open Insights or Overview to see updated results.${warnNote}`);
      router.refresh();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setGenerateError(
          "Request timed out after 4 minutes. Refresh Settings — analysis may still have saved."
        );
      } else {
        setGenerateError(err instanceof Error ? err.message : "Analysis request failed.");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    const ok = confirm("Delete this workshop and all its data? This cannot be undone.");
    if (!ok) return;
    try {
      await deleteWorkshop(workshop.id);
      window.location.href = "/workshops";
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  const canGenerateLegacy = dataStatus.a || dataStatus.b || dataStatus.c;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Workshop Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage workshop details and upload survey data.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Workshop Details</h3>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium text-foreground">{workshop.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cohort</p>
            <p className="font-medium text-foreground">{workshop.cohort}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium text-foreground">{workshop.location || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{workshop.date || "—"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Survey Files</h3>

        <UploadFormCard
          workshopId={workshop.id}
          stage="a"
          title="Form A · Original Understanding"
          subtitle="Before the workshop"
          uploaded={dataStatus.a}
          count={dataStatus.aCount}
          onUploaded={refreshAfterUpload}
        />

        <UploadFormCard
          workshopId={workshop.id}
          stage="b"
          title="Form B · Retrospective Reflection"
          subtitle="Revised pre-workshop view"
          uploaded={dataStatus.b}
          count={dataStatus.bCount}
          onUploaded={refreshAfterUpload}
        />

        <UploadFormCard
          workshopId={workshop.id}
          stage="c"
          title="Form C · Current Understanding"
          subtitle="After the workshop"
          uploaded={dataStatus.c}
          count={dataStatus.cCount}
          onUploaded={refreshAfterUpload}
        />
      </div>

      {canGenerateLegacy && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            This may take up to a minute for large survey files. Keep this tab open until it finishes.
          </p>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Analysis
              </>
            )}
          </button>
          {generateError && <p className="text-xs text-red-600">{generateError}</p>}
          {generateSuccess && (
            <p className="text-xs text-[#2d8a62]">{generateSuccess}</p>
          )}
        </div>
      )}

      {dataStatus.analysis && (
        <div className="rounded-2xl border border-[#44E6AD]/20 bg-[#44E6AD]/5 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[#44E6AD]" />
          <p className="text-sm font-semibold text-foreground">Analysis Complete</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dataStatus.matchedCount} matched participants analyzed.
          </p>
          <Link
            href={`/workshops/${workshop.id}/overview`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            View Overview
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
        <p className="mt-1 text-xs text-red-600">
          Permanently delete this workshop and all uploaded data.
        </p>
        <button
          onClick={handleDelete}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete Workshop
        </button>
      </div>

      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Generating analysis…</p>
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Merging forms and computing metrics. This can take about a minute.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
