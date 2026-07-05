"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/navigation";
import { useSidebar } from "@/hooks/useSidebar";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-dark/20 backdrop-blur-sm lg:hidden"
            onClick={close}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-border bg-surface",
          "lg:relative lg:z-auto lg:opacity-100",
          isOpen ? "lg:w-[280px]" : "lg:w-[72px]"
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 transition-opacity",
              !isOpen && "lg:opacity-0 lg:pointer-events-none"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Awaaz Labs
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Impact Analytics
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 shrink-0"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <X className="h-4 w-4 lg:hidden" />
            ) : null}
            <ChevronLeft
              className={cn(
                "h-4 w-4 hidden lg:block transition-transform",
                !isOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) close();
                    }}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    title={!isOpen ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "truncate transition-opacity",
                        !isOpen && "lg:hidden"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "shrink-0 border-t border-border p-4",
            !isOpen && "lg:hidden"
          )}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            Justice Innovation Workshop Analytics
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            Placeholder data — analytics pending
          </p>
        </div>
      </motion.aside>
    </>
  );
}
