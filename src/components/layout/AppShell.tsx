"use client";

import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  workshopId?: string;
  workshopName?: string;
}

export function AppShell({ children, workshopId, workshopName }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar workshopId={workshopId} workshopName={workshopName} />
      <main className="pl-[240px] transition-all duration-300">
        <div className="mx-auto max-w-5xl px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
