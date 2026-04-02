"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useProtectedRoute } from "@/lib/hooks";

export default function UploadRedirectPage() {
  const ready = useProtectedRoute();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace("/batches");
  }, [ready, router]);

  return null;
}
