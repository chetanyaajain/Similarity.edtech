"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, clearAuthToken, fetchJson, getAuthToken } from "@/lib/api";

export function useProtectedRoute() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth/login");
      return;
    }
    setReady(true);
  }, [router]);

  return ready;
}

export function useApi<T>(path: string | null) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) return;
    setLoading(true);
    fetchJson<T>(path)
      .then((response) => {
        if (!active) return;
        setData(response);
        setError(null);
      })
      .catch((err: Error) => {
        if (!active) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearAuthToken();
          router.replace("/auth/login");
        }
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path, router]);

  return { data, loading, error, setData };
}
