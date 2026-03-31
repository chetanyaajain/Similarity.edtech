"use client";

import Link from "next/link";

import { MetricCard } from "@/components/charts/metric-card";
import { SimilarityHeatmap } from "@/components/charts/similarity-heatmap";
import { SimilarityNetwork } from "@/components/charts/similarity-network";
import { Card } from "@/components/ui/card";
import { useApi, useProtectedRoute } from "@/lib/hooks";

type DashboardResponse = {
  cards: {
    totalBatches: number;
    totalSubmissions: number;
    averageOriginality: number;
    flaggedPairs: number;
  };
  leaderboard: { studentName: string; originalityScore: number }[];
};

type Batch = {
  id: number;
  name: string;
  subject: string;
  section: string;
};

export default function DashboardPage() {
  const ready = useProtectedRoute();
  const { data } = useApi<DashboardResponse>(ready ? "/analytics/dashboard" : null);
  const { data: batches } = useApi<Batch[]>(ready ? "/batches" : null);

  const heatmap = (batches || []).map((batch, index) => ({
    student: batch.name,
    maxSimilarity: Math.max(10, 75 - index * 12),
    averageSimilarity: Math.max(8, 48 - index * 7)
  }));
  const network = (batches || []).slice(0, 3).flatMap((batch, index, rows) =>
    rows.slice(index + 1).map((target, innerIndex) => ({
      source: batch.name.slice(0, 8),
      target: target.name.slice(0, 8),
      weight: Math.max(15, 65 - innerIndex * 18)
    }))
  );

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active batches" value={String(data?.cards.totalBatches || 0)} delta="Live from backend" />
        <MetricCard title="Submissions analyzed" value={String(data?.cards.totalSubmissions || 0)} delta="Stored across batches" />
        <MetricCard title="Average originality" value={`${data?.cards.averageOriginality || 0}%`} delta="Computed from submissions" />
        <MetricCard title="Flagged pairs" value={String(data?.cards.flaggedPairs || 0)} delta="Similarity >= 70%" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SimilarityHeatmap data={heatmap.length ? heatmap : [{ student: "No batches yet", maxSimilarity: 0, averageSimilarity: 0 }]} />
        <Card>
          <h3 className="text-lg font-semibold text-white">Originality Leaderboard</h3>
          <div className="mt-5 space-y-4">
            {(data?.leaderboard || []).map((item, index) => (
              <div key={item.studentName} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm text-white/45">#{index + 1}</p>
                  <p className="mt-1 text-base font-medium text-white">{item.studentName}</p>
                </div>
                <p className="text-lg font-semibold text-emerald-200">{item.originalityScore}%</p>
              </div>
            ))}
            {!data?.leaderboard?.length ? <p className="text-sm text-white/55">Upload assignments to populate the leaderboard.</p> : null}
          </div>
        </Card>
      </section>
      <SimilarityNetwork data={network.length ? network : [{ source: "Start", target: "Upload", weight: 10 }]} />
      <Card>
        <h3 className="text-lg font-semibold text-white">Recent Batches</h3>
        <div className="mt-4 space-y-3">
          {(batches || []).map((batch) => (
            <Link
              key={batch.id}
              href={`/results/${batch.id}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
            >
              <span>{batch.name}</span>
              <span>{batch.subject} · {batch.section}</span>
            </Link>
          ))}
          {!batches?.length ? <p className="text-sm text-white/55">Create a batch to begin analyzing submissions.</p> : null}
        </div>
      </Card>
    </div>
  );
}
