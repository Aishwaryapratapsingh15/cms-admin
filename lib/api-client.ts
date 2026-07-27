import "server-only";

import { cookies } from "next/headers";
import { API_URL, ACCESS_TOKEN_COOKIE } from "./constants";
import type { ApiEnvelope } from "./types";

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(status: number, message: string, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  // The backend's generic exception filter sends a blanket `message` (e.g.
  // "Validation failed") alongside the real field-level messages in `errors`.
  // Surface the specific ones when present instead of the useless generic one.
  get detail(): string {
    if (this.errors && this.errors.length > 0) {
      return this.errors.join(" ");
    }
    return this.message;
  }
}

// Token freshness is middleware's job (it runs before this on every protected
// request and rotates the cookie there, since only middleware/route handlers
// can set cookies). This client just reads whatever cookie is currently set.
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !body || body.success === false) {
    throw new ApiError(res.status, body?.message ?? res.statusText, body?.errors);
  }

  return body.data;
}
