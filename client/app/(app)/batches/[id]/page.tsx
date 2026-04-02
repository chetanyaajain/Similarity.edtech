"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BatchWorkspaceShell } from "@/components/batches/batch-workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchJson } from "@/lib/api";
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
  originality_score: number;
};

type Edge = {
  id: number;
  source_submission_id: number;
  target_submission_id: number;
  similarity_percentage: number;
};

export default function BatchOverviewPage({ params }: { params: { id: string } }) {
  const ready = useProtectedRoute();
  const router = useRouter();
  const { data: batch } = useApi<Batch>(ready ? `/batches/${params.id}` : null);
  const { data: submissions } = useApi<Submission[]>(ready ? `/submissions/batch/${params.id}` : null);
  const { data: edges } = useApi<Edge[]>(ready ? `/submissions/batch/${params.id}/edges` : null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!ready || !batch) return null;

  const topEdge = [...(edges || [])].sort(
    (a, b) => b.similarity_percentage - a.similarity_percentage
  )[0];
  const topPair = topEdge
    ? {
        source: submissions?.find((item) => item.id === topEdge.source_submission_id),
        target: submissions?.find((item) => item.id === topEdge.target_submission_id),
      }
    : null;

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${batch.name}" and all its uploads, results, and reports? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await fetchJson(`/batches/${params.id}`, { method: "DELETE" });
      router.push("/batches");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <BatchWorkspaceShell
      batchId={params.id}
      batchName={batch.name}
      batchMeta={`${batch.subject} · Section ${batch.section} · ${batch.year}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <h3 className="text-lg font-semibold text-white">Batch Snapshot</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Submissions</p>
              <p className="mt-2 text-3xl font-semibold text-white">{submissions?.length || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Similarity pairs</p>
              <p className="mt-2 text-3xl font-semibold text-white">{edges?.length || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Highest overlap</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {Math.round(topEdge?.similarity_percentage || 0)}%
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/batches/${params.id}/upload`} className="rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-sm text-sky-100">
              Upload assignment
            </Link>
            <Link href={`/batches/${params.id}/results`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">
              Review results
            </Link>
            <Link href={`/batches/${params.id}/reports`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">
              Generate report
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-rose-400/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting batch..." : "Delete batch"}
            </Button>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white">Top Similar Pair</h3>
          {topPair?.source && topPair?.target ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                <p className="text-sm font-medium text-white">
                  {topPair.source.student_name} ({topPair.source.student_prn || "No PRN"}) vs {topPair.target.student_name} ({topPair.target.student_prn || "No PRN"})
                </p>
                <p className="mt-2 text-sm text-white/65">
                  {topPair.source.filename} matched with {topPair.target.filename}
                </p>
                <p className="mt-3 text-2xl font-semibold text-rose-100">
                  {Math.round(topEdge?.similarity_percentage || 0)}% similarity
                </p>
              </div>
              <Link href={`/batches/${params.id}/results`} className="text-sm text-sky-200">
                Open full pairwise results
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm text-white/60">
              Upload at least two assignments inside this batch to generate pairwise similarity results.
            </p>
          )}
        </Card>
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
        <div className="mt-4 space-y-3">
          {(submissions || []).map((submission) => (
            <div
              key={submission.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75"
            >
              <div>
                <p className="font-medium text-white">
                  {submission.student_name} {submission.student_prn ? `· ${submission.student_prn}` : ""}
                </p>
                <p className="mt-1 text-white/50">{submission.filename}</p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                {Math.round(submission.originality_score)}% originality
              </div>
            </div>
          ))}
          {!submissions?.length ? (
            <p className="text-sm text-white/50">No submissions yet for this batch.</p>
          ) : null}
        </div>
      </Card>
    </BatchWorkspaceShell>
  );
}
