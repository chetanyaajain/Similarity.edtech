import { Card } from "@/components/ui/card";

type HeatmapDatum = {
  student: string;
  maxSimilarity: number;
  averageSimilarity: number;
};

export function SimilarityHeatmap({ data }: { data: HeatmapDatum[] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Similarity Heatmap</h3>
          <p className="text-sm text-white/55">Highest overlap patterns by student</p>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((row) => (
          <div key={row.student}>
            <div className="mb-2 flex items-center justify-between text-sm text-white/70">
              <span>{row.student}</span>
              <span>{row.maxSimilarity}% max</span>
            </div>
            <div className="h-3 rounded-full bg-white/8">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500"
                style={{ width: `${row.maxSimilarity}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

