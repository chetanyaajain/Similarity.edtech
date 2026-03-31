import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/75",
        className
      )}
      {...props}
    />
  );
}

