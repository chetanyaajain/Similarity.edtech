"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetchJson<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setAuthToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function useDemoAccount() {
    setEmail("teacher2@example.com");
    setPassword("Password123");
    setLoading(true);
    setError("");
    try {
      const response = await fetchJson<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "teacher2@example.com", password: "Password123" })
      });
      setAuthToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.28em] text-white/45">Welcome back</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to SimilarityIQ</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input placeholder="Faculty email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={useDemoAccount} disabled={loading}>
            Use demo account
          </Button>
        </form>
        <p className="mt-6 text-sm text-white/55">
          Need an account?{" "}
          <Link href="/auth/signup" className="text-sky-200">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}
