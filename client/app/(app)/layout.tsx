"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useProtectedRoute } from "@/lib/hooks";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  const ready = useProtectedRoute();

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-white/70">
        Redirecting to login...
      </main>
    );
  }

  return <AppShell>{children}</AppShell>;
}
