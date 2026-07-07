import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Workshop Impact Analytics | Awaaz Leadership Labs",
    template: "%s | Awaaz Impact Analytics",
  },
  description:
    "Evaluate the impact of Justice Innovation workshops using participant responses. Built for Awaaz Leadership Labs educators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
