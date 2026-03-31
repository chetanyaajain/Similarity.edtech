"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";

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
  const { data: batches, setData } = useApi<Batch[]>(ready ? "/batches" : null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");

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
          <Card key={batch.name}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{batch.name}</h3>
                <p className="mt-2 text-sm text-white/55">
                  {batch.subject} · Section {batch.section}
                </p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">{batch.year}</div>
            </div>
            <div className="mt-8 flex items-center justify-between text-sm text-white/60">
              <span>{batch.subject}</span>
              <Link href={`/results/${batch.id}`} className="text-sky-200">Open results</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
