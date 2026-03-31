import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <Sidebar />
        <div className="flex-1">
          <header className="mb-6 flex items-center justify-between rounded-[28px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Faculty workspace</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">AI Assignment Similarity Checker</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Alerts
              </Button>
              <Button asChild size="sm">
                <Link href="/batches">
                  <Plus className="mr-2 h-4 w-4" />
                  New Batch
                </Link>
              </Button>
            </div>
          </header>
          {children}
          <Link
            href="/batches"
            className="fixed bottom-8 right-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}

