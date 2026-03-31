"use client";

import Link from "next/link";

import { ComparisonPanel } from "@/components/results/comparison-panel";
import { SimilarityHeatmap } from "@/components/charts/similarity-heatmap";
import { Card } from "@/components/ui/card";
import { useApi, useProtectedRoute } from "@/lib/hooks";

type Submission = {
  id: number;
  student_name: string;
  summary: string;
  originality_score: number;
};

type Edge = {
  id: number;
  source_submission_id: number;
  target_submission_id: number;
  similarity_percentage: number;
  explanation: string;
  matched_segments: {
    sourceText: string;
    targetText: string;
    score: number;
  }[];
};

export default function ResultsPage({ params }: { params: { id: string } }) {
  const ready = useProtectedRoute();
  const { data: submissions } = useApi<Submission[]>(ready ? `/submissions/batch/${params.id}` : null);
  const { data: edges } = useApi<Edge[]>(ready ? `/submissions/batch/${params.id}/edges` : null);

  if (!ready) return null;

  const topEdge = [...(edges || [])].sort(
    (a, b) => b.similarity_percentage - a.similarity_percentage
  )[0];
  const source = submissions?.find((item) => item.id === topEdge?.source_submission_id);
  const target = submissions?.find((item) => item.id === topEdge?.target_submission_id);
  const heatmap = (submissions || []).map((item) => ({
    student: item.student_name,
    maxSimilarity:
      Math.round(
        Math.max(
          0,
          ...(edges || [])
            .filter(
              (edge) =>
                edge.source_submission_id === item.id || edge.target_submission_id === item.id
            )
            .map((edge) => edge.similarity_percentage)
        )
      ) || 0,
    averageSimilarity: Math.round(100 - item.originality_score)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Similarity Results</h2>
        <p className="text-sm text-white/55">Review matched sections, semantic overlap, and plagiarism explanations.</p>
      </div>
      {topEdge && source && target ? (
        <ComparisonPanel
          leftStudent={source.student_name}
          rightStudent={target.student_name}
          similarity={topEdge.similarity_percentage}
          explanation={topEdge.explanation}
          matches={topEdge.matched_segments}
        />
      ) : (
        <Card>
          <p className="text-sm text-white/60">
            No similarity pairs yet. Upload one assignment first, then add at least one more assignment in the same batch to generate similarity comparisons.
          </p>
        </Card>
      )}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SimilarityHeatmap data={heatmap.length ? heatmap : [{ student: "No submissions", maxSimilarity: 0, averageSimilarity: 0 }]} />
        <Card>
          <h3 className="text-lg font-semibold text-white">AI Explanation Panel</h3>
          {topEdge ? (
            <>
              <p className="mt-4 text-sm leading-7 text-white/65">{topEdge.explanation}</p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Suggested action: compare the matched segments, then generate the batch report for a complete audit trail.
              </div>
              <Link href={`/reports/${params.id}`} className="mt-4 inline-block text-sm text-sky-200">
                Open report
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm leading-7 text-white/65">The report panel will populate after submissions are processed by the backend and ML service.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
