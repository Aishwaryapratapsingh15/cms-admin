import "server-only";

import { apiFetch } from "./api-client";
import type { User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me");
  } catch {
    return null;
  }
}
