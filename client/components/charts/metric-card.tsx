import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  delta: string;
};

export function MetricCard({ title, value, delta }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/55">{title}</p>
          <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-200">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-sm text-emerald-200">{delta}</p>
    </Card>
  );
}

