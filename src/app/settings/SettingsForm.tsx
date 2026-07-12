"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  uploadPreWorkshop, 
  uploadPostWorkshop, 
  getUploadStatus,
  ActionResponse 
} from "./actions";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { BRAND_COLORS } from "@/constants/colors";

interface SettingsFormProps {
  initialStatus: {
    preUploaded: boolean;
    preCount: number;
    preTime: string;
    postUploaded: boolean;
    postCount: number;
    postTime: string;
    mergedCount: number;
  };
}

export function SettingsForm({ initialStatus }: SettingsFormProps) {
  const [status, setStatus] = useState(initialStatus);
  const [prePending, startPreUpload] = useTransition();
  const [postPending, startPostUpload] = useTransition();
  const [preMessage, setPreMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [postMessage, setPostMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Refresh status from server
  const refreshStatus = async () => {
    const nextStatus = await getUploadStatus();
    setStatus(nextStatus);
  };

  const handlePreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreMessage(null);
    
    const formData = new FormData();
    formData.append("file", file);

    startPreUpload(async () => {
      const res: ActionResponse = await uploadPreWorkshop(formData);
      if (res.success) {
        setPreMessage({ type: "success", text: res.message || "File uploaded successfully." });
        await refreshStatus();
      } else {
        setPreMessage({ type: "error", text: res.message || "Failed to upload file." });
      }
    });
  };

  const handlePostFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPostMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    startPostUpload(async () => {
      const res: ActionResponse = await uploadPostWorkshop(formData);
      if (res.success) {
        setPostMessage({ type: "success", text: res.message || "File uploaded successfully." });
        await refreshStatus();
      } else {
        setPostMessage({ type: "error", text: res.message || "Failed to upload file." });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Active Data Source Summary Metrics (Sleek & Subtler) */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/45 px-3 py-1.5 backdrop-blur-sm text-xs shadow-sm">
          <span className="font-medium text-muted-foreground">Data Source:</span>
          <span className="font-semibold text-foreground">
            {status.preUploaded || status.postUploaded ? "Custom Uploads" : "Mock Data"}
          </span>
        </div>
        
        <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/45 px-3 py-1.5 backdrop-blur-sm text-xs shadow-sm">
          <span className="font-medium text-muted-foreground">Pre-Workshop:</span>
          <span className="font-semibold text-foreground">
            {status.preUploaded ? `${status.preCount} responses` : "Default Placeholders"}
          </span>
          {status.preUploaded && <span className="text-[10px] text-muted-foreground/60">({status.preTime})</span>}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/45 px-3 py-1.5 backdrop-blur-sm text-xs shadow-sm">
          <span className="font-medium text-muted-foreground">Post-Workshop:</span>
          <span className="font-semibold text-foreground">
            {status.postUploaded ? `${status.postCount} responses` : "Default Placeholders"}
          </span>
          {status.postUploaded && <span className="text-[10px] text-muted-foreground/60">({status.postTime})</span>}
        </div>
      </div>

      {/* Dataset Matching Summary Card */}
      {status.preUploaded && status.postUploaded && (
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md">
          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Successfully Matched Data</h4>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Parsed pre and post forms and successfully matched **{status.mergedCount}** participants using email or name key comparisons. All dashboard metrics have been updated.
            </p>
          </div>
        </div>
      )}

      {/* Upload Dropzones */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pre-Workshop Upload */}
        <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <FileSpreadsheet className="text-indigo-500" size={20} />
              Pre-Workshop Response Sheet
            </h3>
            {status.preUploaded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 size={12} /> Ready
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload the Pre-Workshop survey results containing initial identity understanding, expectations, and confidence metrics.
          </p>

          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] cursor-pointer rounded-xl py-8 px-4 transition-all group">
            <input 
              type="file" 
              accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
              className="hidden" 
              onChange={handlePreFileChange}
              disabled={prePending}
            />
            {prePending ? (
              <div className="flex flex-col items-center gap-2 text-indigo-500">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-sm font-medium">Parsing and validating sheet...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-muted-foreground group-hover:text-foreground transition-colors">
                <UploadCloud size={32} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-medium">Drag & drop or click to choose file</span>
                <span className="text-xs text-muted-foreground/60">Supports CSV, XLSX up to 10MB</span>
              </div>
            )}
          </label>

          {preMessage && (
            <div className={`flex items-start gap-2 rounded-xl p-3 text-xs leading-normal ${
              preMessage.type === "success" 
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20"
            }`}>
              {preMessage.type === "success" ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <span>{preMessage.text}</span>
            </div>
          )}
        </div>

        {/* Post-Workshop Upload */}
        <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <FileSpreadsheet className="text-indigo-500" size={20} />
              Post-Workshop Response Sheet
            </h3>
            {status.postUploaded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 size={12} /> Ready
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload the Post-Workshop survey results containing final evaluation, activity effectiveness, and qualitative reflections.
          </p>

          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] cursor-pointer rounded-xl py-8 px-4 transition-all group">
            <input 
              type="file" 
              accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
              className="hidden" 
              onChange={handlePostFileChange}
              disabled={postPending}
            />
            {postPending ? (
              <div className="flex flex-col items-center gap-2 text-indigo-500">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-sm font-medium">Parsing and validating sheet...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-muted-foreground group-hover:text-foreground transition-colors">
                <UploadCloud size={32} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-medium">Drag & drop or click to choose file</span>
                <span className="text-xs text-muted-foreground/60">Supports CSV, XLSX up to 10MB</span>
              </div>
            )}
          </label>

          {postMessage && (
            <div className={`flex items-start gap-2 rounded-xl p-3 text-xs leading-normal ${
              postMessage.type === "success" 
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20"
            }`}>
              {postMessage.type === "success" ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <span>{postMessage.text}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
