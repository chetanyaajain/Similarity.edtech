"use client";

import Link from "next/link";
import { BarChart3, FileSearch2, FolderKanban, LayoutDashboard, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/batches", label: "Batches", icon: FolderKanban },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/results/1", label: "Results", icon: FileSearch2 },
  { href: "/reports/1", label: "Reports", icon: BarChart3 }
];

export function Sidebar() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),rgba(10,14,23,0.76)] p-5 backdrop-blur-2xl lg:block"
    >
      <div className="mb-8 px-3">
        <p className="font-display text-2xl tracking-tight text-white">SimilarityIQ</p>
        <p className="mt-2 text-sm text-white/55">AI-first academic integrity workspace</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}

