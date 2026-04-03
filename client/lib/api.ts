const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("similarity_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // Keep the default fallback message when a JSON body is not available.
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export async function fetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("similarity_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // Use fallback message when the response is not JSON.
    }
    throw new ApiError(response.status, message);
  }

  return response.blob();
}

export function setAuthToken(token: string) {
  window.localStorage.setItem("similarity_token", token);
}

export function getAuthToken() {
  return typeof window !== "undefined"
    ? window.localStorage.getItem("similarity_token")
    : null;
}

export function clearAuthToken() {
  window.localStorage.removeItem("similarity_token");
}
