import Link from "next/link";
import { getUploadStatus } from "./settings/actions";
import { ArrowRight, Upload, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Awaaz Impact Analytics",
};

export default async function HomePage() {
  const status = await getUploadStatus();
  const hasData = status.preUploaded || status.postUploaded;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1
            className="font-[family-name:var(--font-display)] text-foreground"
            style={{ fontSize: "52px", lineHeight: "1.1", color: "#E8126E" }}
          >
            Workshop Analysis
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Evaluate the impact of Justice Innovation workshops using
            participant responses. Built for Awaaz Leadership Labs educators.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {hasData ? (
            <Link
              href="/workshop-overview"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <BarChart3 className="h-4 w-4" />
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Upload className="h-4 w-4" />
              Upload Survey Data
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {hasData && (
          <p className="text-xs text-muted-foreground/70">
            {status.preCount + status.postCount} responses uploaded ·{" "}
            {status.mergedCount} matched participants
          </p>
        )}

        {!hasData && (
          <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md">
            <p className="text-sm text-muted-foreground">
              Upload your pre and post workshop survey files to see analytics.
              Supported formats: <span className="font-medium text-foreground">CSV</span> and <span className="font-medium text-foreground">XLSX</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
