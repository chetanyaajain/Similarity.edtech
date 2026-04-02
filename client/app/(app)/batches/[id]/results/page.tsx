"use client";

import Link from "next/link";

import { BatchWorkspaceShell } from "@/components/batches/batch-workspace-shell";
import { SimilarityHeatmap } from "@/components/charts/similarity-heatmap";
import { ComparisonPanel } from "@/components/results/comparison-panel";
import { Card } from "@/components/ui/card";
import { useApi, useProtectedRoute } from "@/lib/hooks";

type Batch = {
  id: number;
  name: string;
  year: string;
  subject: string;
  section: string;
};

type Submission = {
  id: number;
  student_prn: string | null;
  student_name: string;
  filename: string;
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

export default function BatchResultsPage({ params }: { params: { id: string } }) {
  const ready = useProtectedRoute();
  const { data: batch } = useApi<Batch>(ready ? `/batches/${params.id}` : null);
  const { data: submissions } = useApi<Submission[]>(ready ? `/submissions/batch/${params.id}` : null);
  const { data: edges } = useApi<Edge[]>(ready ? `/submissions/batch/${params.id}/edges` : null);

  if (!ready || !batch) return null;

  const sortedEdges = [...(edges || [])].sort(
    (a, b) => b.similarity_percentage - a.similarity_percentage
  );
  const topEdge = sortedEdges[0];
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
              (edge) => edge.source_submission_id === item.id || edge.target_submission_id === item.id
            )
            .map((edge) => edge.similarity_percentage)
        )
      ) || 0,
    averageSimilarity: Math.round(100 - item.originality_score),
  }));

  return (
    <BatchWorkspaceShell
      batchId={params.id}
      batchName={batch.name}
      batchMeta={`${batch.subject} · Section ${batch.section} · ${batch.year}`}
    >
      {topEdge && source && target ? (
        <ComparisonPanel
          leftStudent={`${source.student_name}${source.student_prn ? ` (${source.student_prn})` : ""}`}
          rightStudent={`${target.student_name}${target.student_prn ? ` (${target.student_prn})` : ""}`}
          leftMeta={source.filename}
          rightMeta={target.filename}
          similarity={topEdge.similarity_percentage}
          explanation={topEdge.explanation}
          matches={topEdge.matched_segments}
        />
      ) : (
        <Card>
          <p className="text-sm text-white/60">
            No similarity pairs yet. Upload one assignment inside this batch, then add at least one more assignment here to generate comparisons.
          </p>
        </Card>
      )}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SimilarityHeatmap
          data={heatmap.length ? heatmap : [{ student: "No submissions", maxSimilarity: 0, averageSimilarity: 0 }]}
        />
        <Card>
          <h3 className="text-lg font-semibold text-white">Pairwise Similarity Matrix</h3>
          <div className="mt-4 space-y-3">
            {sortedEdges.map((edge) => {
              const left = submissions?.find((item) => item.id === edge.source_submission_id);
              const right = submissions?.find((item) => item.id === edge.target_submission_id);

              return (
                <div key={edge.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {left?.student_name || "Unknown"} {left?.student_prn ? `(${left.student_prn})` : ""} vs{" "}
                        {right?.student_name || "Unknown"} {right?.student_prn ? `(${right.student_prn})` : ""}
                      </p>
                      <p className="mt-1 text-sm text-white/50">
                        {left?.filename || "Unknown file"} matched with {right?.filename || "Unknown file"}
                      </p>
                    </div>
                    <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm text-rose-100">
                      {Math.round(edge.similarity_percentage)}%
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/65">{edge.explanation}</p>
                </div>
              );
            })}
            {!sortedEdges.length ? (
              <p className="text-sm text-white/50">No pairwise matches are available for this batch yet.</p>
            ) : null}
          </div>
          {sortedEdges.length ? (
            <Link href={`/batches/${params.id}/reports`} className="mt-4 inline-block text-sm text-sky-200">
              Open batch report
            </Link>
          ) : null}
        </Card>
      </div>
    </BatchWorkspaceShell>
  );
}
