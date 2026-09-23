import "./globals.css";
import { Suspense } from "react";
import { MetaProvider } from "@/components/MetaProvider";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "DealerPulse — Dealership Performance",
  description: "Real-time sales performance across the dealership group.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="p-8 text-sm text-ink-faint">Loading…</div>}>
          <MetaProvider>
            <AppShell>{children}</AppShell>
          </MetaProvider>
        </Suspense>
      </body>
    </html>
  );
}
