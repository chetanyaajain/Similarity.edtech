"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type BatchWorkspaceShellProps = {
  batchId: string;
  batchName: string;
  batchMeta: string;
  children: React.ReactNode;
};

const tabs = [
  { key: "overview", label: "Overview", href: (batchId: string) => `/batches/${batchId}` },
  { key: "upload", label: "Upload", href: (batchId: string) => `/batches/${batchId}/upload` },
  { key: "results", label: "Results", href: (batchId: string) => `/batches/${batchId}/results` },
  { key: "reports", label: "Reports", href: (batchId: string) => `/batches/${batchId}/reports` },
];

export function BatchWorkspaceShell(props: BatchWorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-200/80">Batch Workspace</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">{props.batchName}</h2>
            <p className="mt-2 text-sm text-white/55">{props.batchMeta}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const href = tab.href(props.batchId);
              const active = pathname === href;
              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    active
                      ? "border-sky-300/40 bg-sky-400/15 text-sky-100"
                      : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
}
