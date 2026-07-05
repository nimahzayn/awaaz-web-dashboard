"use client";

import { Search, Bell, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/hooks/useSidebar";

export function Navbar() {
  const { toggle, isOpen } = useSidebar();
  const [isDark, setIsDark] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="lg:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search workshops, participants, insights..."
          className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Global search"
          disabled
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="hidden sm:flex items-center gap-2 rounded-xl border border-border px-3 py-1.5"
          aria-label="Theme toggle placeholder"
        >
          <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Switch
            checked={isDark}
            onCheckedChange={setIsDark}
            aria-label="Toggle dark mode"
            disabled
          />
          <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          disabled
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <button
          className="flex items-center gap-2 rounded-xl border border-border px-2 py-1.5 transition-colors hover:bg-muted"
          aria-label="User profile"
          disabled
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              AL
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            Educator
          </span>
        </button>
      </div>
    </header>
  );
}
