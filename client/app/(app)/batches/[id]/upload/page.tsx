"use client";

import { UploadCloud } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BatchWorkspaceShell } from "@/components/batches/batch-workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/api";
import { useApi, useProtectedRoute } from "@/lib/hooks";
import { parseStudentIdentity } from "@/lib/student-identity";

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

export default function BatchUploadPage({ params }: { params: { id: string } }) {
  const ready = useProtectedRoute();
  const router = useRouter();
  const [studentEmail, setStudentEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const { data: batch } = useApi<Batch>(ready ? `/batches/${params.id}` : null);
  const { data: submissions } = useApi<Submission[]>(ready ? `/submissions/batch/${params.id}` : null);

  const parsedIdentity = file ? parseStudentIdentity(file.name) : null;
  const canSubmit = useMemo(() => Boolean(file), [file]);

  if (!ready || !batch) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setStatus("Uploading and analyzing this batch...");
    try {
      const formData = new FormData();
      formData.append("batch_id", params.id);
      formData.append("students", JSON.stringify([{ studentEmail }]));
      formData.append("files", file);

      await fetchJson("/submissions/upload", {
        method: "POST",
        body: formData,
      });
      setStatus(`Upload complete for ${parsedIdentity?.name || "student"}. Redirecting to batch results...`);
      router.push(`/batches/${params.id}/results`);
    } catch (err) {
      setStatus(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.");
    }
  }

  return (
    <BatchWorkspaceShell
      batchId={params.id}
      batchName={batch.name}
      batchMeta={`${batch.subject} · Section ${batch.section} · ${batch.year}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-dashed border-sky-300/25 p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-400/10 text-sky-200">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-white">Upload inside {batch.name}</h3>
          <p className="mt-3 text-sm text-white/55">
            Filename format should be <span className="text-white">PRN_name.pdf</span>. We automatically extract the PRN and student name from the file itself.
          </p>
          <input
            className="mt-6 block w-full text-sm text-white/70"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          {parsedIdentity ? (
            <div className="mt-5 rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4 text-left text-sm text-sky-50">
              <p>Detected PRN: {parsedIdentity.prn || "Not found"}</p>
              <p className="mt-1">Detected student: {parsedIdentity.name}</p>
            </div>
          ) : null}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white">Optional notification email</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="student@example.com"
              type="email"
              value={studentEmail}
              onChange={(event) => setStudentEmail(event.target.value)}
            />
            <Button type="submit" disabled={!canSubmit}>
              Upload assignment
            </Button>
          </div>
          {status ? <p className="mt-4 text-sm text-sky-200">{status}</p> : null}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white">Assignments already in this batch</h3>
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
              <p className="text-sm text-white/50">No uploads stored in this batch yet.</p>
            ) : null}
          </div>
        </Card>
      </form>
    </BatchWorkspaceShell>
  );
}
