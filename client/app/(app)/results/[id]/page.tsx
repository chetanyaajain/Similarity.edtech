"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useProtectedRoute } from "@/lib/hooks";

export default function ResultsRedirectPage({ params }: { params: { id: string } }) {
  const ready = useProtectedRoute();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(`/batches/${params.id}/results`);
  }, [params.id, ready, router]);

  return null;
}
