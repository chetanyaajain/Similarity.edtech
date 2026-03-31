"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearAuthToken, fetchJson, setAuthToken } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAuthToken();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetchJson<{ access_token: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, email, password, preferred_language: "en" })
      });
      setAuthToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.28em] text-white/45">Start trial</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create your faculty workspace</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <Input placeholder="Institution email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-white/55">
          Already have access?{" "}
          <Link href="/auth/login" className="text-sky-200">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
