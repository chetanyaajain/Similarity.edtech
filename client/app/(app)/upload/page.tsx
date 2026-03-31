"use client";

import { UploadCloud } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/api";
import { useApi, useProtectedRoute } from "@/lib/hooks";

type Batch = {
  id: number;
  name: string;
};

type Submission = {
  id: number;
  student_name: string;
  filename: string;
  originality_score: number;
};

export default function UploadPage() {
  const ready = useProtectedRoute();
  const router = useRouter();
  const [batchId, setBatchId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const { data: batches } = useApi<Batch[]>(ready ? "/batches" : null);
  const { data: submissions } = useApi<Submission[]>(
    ready && batchId ? `/submissions/batch/${batchId}` : null
  );

  const canSubmit = useMemo(
    () => Boolean(batchId && studentName && file),
    [batchId, studentName, file]
  );

  if (!ready) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setStatus("Uploading and analyzing...");
    try {
      const formData = new FormData();
      formData.append("batch_id", batchId);
      formData.append(
        "students",
        JSON.stringify([
          {
            studentName,
            studentEmail
          }
        ])
      );
      formData.append("files", file);

      await fetchJson("/submissions/upload", {
        method: "POST",
        body: formData
      });
      setStatus(`Upload complete for ${studentName}. Redirecting to results...`);
      router.push(`/results/${batchId}`);
    } catch (err) {
      setStatus(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Upload Assignments</h2>
        <p className="text-sm text-white/55">Upload one assignment at a time so each student submission is analyzed cleanly.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-dashed border-sky-300/25 p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-400/10 text-sky-200">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-white">Upload one file</h3>
          <p className="mt-3 text-sm text-white/55">Choose a single PDF, DOCX, or TXT file for one student submission.</p>
          <input
            className="mt-6 block w-full text-sm text-white/70"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          {file ? <p className="mt-3 text-sm text-sky-200">{file.name}</p> : null}
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={batchId} onChange={(event) => setBatchId(event.target.value)}>
            <option value="">Select batch</option>
            {(batches || []).map((batch) => (
              <option key={batch.id} value={String(batch.id)}>
                {batch.name}
              </option>
            ))}
          </Select>
          <Input placeholder="Student name" value={studentName} onChange={(event) => setStudentName(event.target.value)} />
          <Input placeholder="Student email" type="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} />
        </div>
        {status ? <p className="text-sm text-sky-200">{status}</p> : null}
        {batchId ? (
          <Card className="p-5">
            <h3 className="text-base font-semibold text-white">Current submissions in this batch</h3>
            <div className="mt-4 space-y-3">
              {(submissions || []).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75"
                >
                  <span>
                    {submission.student_name} · {submission.filename}
                  </span>
                  <span>{submission.originality_score}% originality</span>
                </div>
              ))}
              {!submissions?.length ? (
                <p className="text-sm text-white/50">No uploads stored in this batch yet.</p>
              ) : null}
            </div>
          </Card>
        ) : null}
        <Button type="submit" disabled={!canSubmit}>
          Upload assignment
        </Button>
      </form>
    </div>
  );
}
