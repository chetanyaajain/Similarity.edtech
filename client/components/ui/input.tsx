import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-sky-400/50",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

