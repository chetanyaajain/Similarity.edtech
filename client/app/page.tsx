import Link from "next/link";
import { ArrowRight, BrainCircuit, FileCode2, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { messages } from "@/lib/i18n";

const features = [
  {
    title: "Hybrid AI similarity engine",
    body: "Blend TF-IDF, cosine similarity, and Sentence-BERT to catch direct overlap and paraphrased plagiarism.",
    icon: BrainCircuit
  },
  {
    title: "Live educator workflow",
    body: "Track uploads, processing progress, report generation, and batch health in a unified faculty workspace.",
    icon: FileCode2
  },
  {
    title: "Enterprise-grade controls",
    body: "JWT auth, validated uploads, role-ready architecture, rate limiting, logging, and deployment-ready containers.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  const copy = messages.en;

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/8 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg text-white">SimilarityIQ</p>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Academic Integrity OS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Start free trial</Link>
            </Button>
          </div>
        </header>

        <section className="grid items-center gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge>Built for modern educators</Badge>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-none text-white md:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/65">{copy.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/batches">Open batch workspace</Link>
              </Button>
            </div>
          </div>
          <Card className="glass-panel relative overflow-hidden border-white/15">
            <div className="absolute inset-0 bg-grid-fade bg-[size:28px_28px] opacity-20" />
            <div className="relative space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-white/60">Processing batch</span>
                  <span className="text-sm text-sky-200">87%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 w-[87%] rounded-full bg-gradient-to-r from-sky-300 via-cyan-400 to-orange-400" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                  <p className="text-sm text-white/60">Paraphrase risk</p>
                  <p className="mt-3 text-3xl font-semibold text-white">72.4%</p>
                  <p className="mt-2 text-sm text-orange-200">Sentence-level alignment detected</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                  <p className="text-sm text-white/60">Originality leader</p>
                  <p className="mt-3 text-3xl font-semibold text-white">Aarav</p>
                  <p className="mt-2 text-sm text-emerald-200">98.2 originality score</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 pb-20 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{feature.body}</p>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
