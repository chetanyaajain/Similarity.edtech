import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-foreground outline-none transition focus:border-sky-400/50",
      className
    )}
    {...props}
  />
));

Select.displayName = "Select";

