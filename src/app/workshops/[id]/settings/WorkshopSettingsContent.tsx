"use client";

import { useRouter } from "next/navigation";
import { useTransition, useRef } from "react";
import { uploadFormA, uploadFormB, uploadFormC, generateAnalysis, deleteWorkshop } from "@/services/workshop-actions";
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

interface FormCardProps {
  title: string;
  subtitle: string;
  uploaded: boolean;
  count: number;
  onUpload: (formData: FormData) => Promise<void>;
}

function UploadFormCard({ title, subtitle, uploaded, count, onUpload }: Omit<FormCardProps, "pending">) {
  const formRef = useRef<HTMLFormElement>(null);

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
      </div>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          if (!formRef.current) return;
          const fd = new FormData(formRef.current);
          formRef.current.reset();
          void onUpload(fd);
        }}
        className="flex items-center gap-3"
      >
        <label className="flex-1 cursor-pointer">
          <input type="file" name="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) formRef.current?.requestSubmit(); }} />
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
            <Upload className="h-4 w-4" />
            {uploaded ? "Replace file" : "Upload CSV or XLSX"}
          </div>
        </label>
      </form>
    </div>
  );
}

export function WorkshopSettingsContent({ workshop, dataStatus }: { workshop: Workshop; dataStatus: DataStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleUpload(uploader: (id: string, formData: FormData) => Promise<any>, formData: FormData) {
    startTransition(async () => {
      await uploader(workshop.id, formData);
      router.refresh();
    });
  }

  async function handleGenerate() {
    startTransition(async () => {
      try {
        const result = await generateAnalysis(workshop.id);
        if (result && !result.success && "error" in result) {
          alert("Error: " + result.error);
        }
      } catch (err) {
        alert("Failed: " + String(err));
      }
      router.refresh();
    });
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

  const canGenerate = dataStatus.a && dataStatus.b && dataStatus.c;

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
          title="Form A · Original Understanding"
          subtitle="Before the workshop"
          uploaded={dataStatus.a}
          count={dataStatus.aCount}
          onUpload={(fd) => handleUpload(uploadFormA, fd)}
        />

        <UploadFormCard
          title="Form B · Retrospective Reflection"
          subtitle="Revised pre-workshop view"
          uploaded={dataStatus.b}
          count={dataStatus.bCount}
          onUpload={(fd) => handleUpload(uploadFormB, fd)}
        />

        <UploadFormCard
          title="Form C · Current Understanding"
          subtitle="After the workshop"
          uploaded={dataStatus.c}
          count={dataStatus.cCount}
          onUpload={(fd) => handleUpload(uploadFormC, fd)}
        />
      </div>

      {canGenerate && (
        <button
          onClick={handleGenerate}
          disabled={pending}
          className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? (
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

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
