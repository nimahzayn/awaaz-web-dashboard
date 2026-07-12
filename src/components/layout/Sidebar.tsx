"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GLOBAL_NAV, WORKSHOP_NAV } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  workshopId?: string;
  workshopName?: string;
}

export function Sidebar({ workshopId, workshopName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const inWorkshop = !!workshopId;
  const basePath = `/workshops/${workshopId}`;
  const navItems = inWorkshop ? WORKSHOP_NAV : GLOBAL_NAV;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-surface transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/workshops" className="flex items-center gap-3 overflow-hidden">
          <img
            src="/awaaz-logo.png"
            alt="Awaaz"
            className="h-8 w-auto shrink-0 object-contain"
          />
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">
              Workshop Analysis
            </span>
          )}
        </Link>
      </div>

      {inWorkshop && !collapsed && (
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">Workshop</p>
          <p className="text-sm font-medium text-foreground truncate">{workshopName}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = inWorkshop ? `${basePath}${item.href}` : item.href;
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
