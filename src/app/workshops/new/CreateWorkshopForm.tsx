"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createWorkshopFromForm } from "@/services/workshop-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Workshop"}
    </button>
  );
}

export function CreateWorkshopForm() {
  const [state, formAction] = useActionState(createWorkshopFromForm, null);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="space-y-2">
        <Link
          href="/workshops"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workshops
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Create Workshop
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up a new workshop to begin collecting and analyzing survey data.
        </p>
      </div>

      <form action={formAction} method="post" className="space-y-5">
        {state?.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Workshop Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Leadership Lab 2025"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="cohort" className="text-sm font-medium text-foreground">
              Cohort
            </label>
            <input
              id="cohort"
              name="cohort"
              required
              placeholder="e.g. Cohort A"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-foreground">
              Location
            </label>
            <input
              id="location"
              name="location"
              required
              placeholder="e.g. Mumbai"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-foreground">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="month"
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Brief description of this workshop's goals or focus..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
