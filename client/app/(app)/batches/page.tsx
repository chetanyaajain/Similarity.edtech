"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/api";
import { useApi, useProtectedRoute } from "@/lib/hooks";

type Batch = {
  id: number;
  name: string;
  year: string;
  subject: string;
  section: string;
};

export default function BatchesPage() {
  const ready = useProtectedRoute();
  const router = useRouter();
  const { data: batches, setData } = useApi<Batch[]>(ready ? "/batches" : null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (!ready) return null;

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const batch = await fetchJson<Batch>("/batches", {
      method: "POST",
      body: JSON.stringify({ name, year, subject, section })
    });
    setData([batch, ...(batches || [])]);
    setName("");
    setYear("");
    setSubject("");
    setSection("");
  }

  async function handleDelete(batch: Batch) {
    const confirmed = window.confirm(
      `Delete "${batch.name}" and all its uploads, results, and reports? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(batch.id);
    try {
      await fetchJson(`/batches/${batch.id}`, { method: "DELETE" });
      setData((batches || []).filter((item) => item.id !== batch.id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Batch Management</h2>
          <p className="text-sm text-white/55">Organize cohorts by year, subject, and section.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create batch
        </Button>
      </div>
      <Card>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
          <Input placeholder="Batch name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input placeholder="Year" value={year} onChange={(event) => setYear(event.target.value)} />
          <Input placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <div className="flex gap-3">
            <Input placeholder="Section" value={section} onChange={(event) => setSection(event.target.value)} />
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(batches || []).map((batch) => (
          <Card key={batch.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{batch.name}</h3>
                <p className="mt-2 text-sm text-white/55">
                  {batch.subject} · Section {batch.section}
                </p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">{batch.year}</div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link href={`/batches/${batch.id}`} className="rounded-full border border-white/10 px-4 py-2 text-white/70 transition hover:border-white/20 hover:text-white">
                Open workspace
              </Link>
              <Link href={`/batches/${batch.id}/upload`} className="rounded-full border border-sky-300/25 px-4 py-2 text-sky-200 transition hover:border-sky-300/40">
                Upload
              </Link>
              <Link href={`/batches/${batch.id}/results`} className="rounded-full border border-white/10 px-4 py-2 text-white/70 transition hover:border-white/20 hover:text-white">
                Results
              </Link>
              <Link href={`/batches/${batch.id}/reports`} className="rounded-full border border-white/10 px-4 py-2 text-white/70 transition hover:border-white/20 hover:text-white">
                Reports
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-rose-400/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"
                onClick={() => handleDelete(batch)}
                disabled={deletingId === batch.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deletingId === batch.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
