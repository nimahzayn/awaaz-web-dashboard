"use client";

import { useRouter } from "next/navigation";
import { useTransition, useRef } from "react";
import { uploadPreWorkshop, uploadPostWorkshop, generateAnalysis } from "@/services/workshop-actions";
import { Upload, FileCheck, Loader2, Sparkles, CheckCircle2, Pencil } from "lucide-react";
import type { Workshop } from "@/types";
import Link from "next/link";

interface WorkshopSettingsContentProps {
  workshop: Workshop;
  dataStatus: {
    pre: boolean;
    post: boolean;
    analysis: boolean;
    preCount: number;
    postCount: number;
    matchedCount: number;
  };
}

export function WorkshopSettingsContent({ workshop, dataStatus }: WorkshopSettingsContentProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const preRef = useRef<HTMLFormElement>(null);
  const postRef = useRef<HTMLFormElement>(null);

  async function handlePreUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await uploadPreWorkshop(workshop.id, form);
      router.refresh();
    });
  }

  async function handlePostUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await uploadPostWorkshop(workshop.id, form);
      router.refresh();
    });
  }

  async function handleGenerate() {
    startTransition(async () => {
      await generateAnalysis(workshop.id);
      router.refresh();
    });
  }

  const canGenerate = dataStatus.pre && dataStatus.post && !dataStatus.analysis;

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

        <div className="rounded-2xl border border-border/60 bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Pre-Workshop Survey</p>
              {dataStatus.pre ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#44E6AD]">
                  <CheckCircle2 className="h-3 w-3" />
                  {dataStatus.preCount} responses uploaded
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Not uploaded yet</p>
              )}
            </div>
          </div>
          <form ref={preRef} onSubmit={handlePreUpload} className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input type="file" name="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) preRef.current?.requestSubmit(); }} />
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <Upload className="h-4 w-4" />
                {dataStatus.pre ? "Replace file" : "Upload CSV or XLSX"}
              </div>
            </label>
          </form>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Post-Workshop Survey</p>
              {dataStatus.post ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#44E6AD]">
                  <CheckCircle2 className="h-3 w-3" />
                  {dataStatus.postCount} responses uploaded
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Not uploaded yet</p>
              )}
            </div>
          </div>
          <form ref={postRef} onSubmit={handlePostUpload} className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input type="file" name="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) postRef.current?.requestSubmit(); }} />
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <Upload className="h-4 w-4" />
                {dataStatus.post ? "Replace file" : "Upload CSV or XLSX"}
              </div>
            </label>
          </form>
        </div>
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
