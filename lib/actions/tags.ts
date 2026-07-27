"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Tag } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function buildPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();

  return { name, slug: slug || undefined };
}

export async function createTagAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/tags");
  return { success: true };
}

export async function updateTagAction(
  tagId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch<Tag>(`/tags/${tagId}`, {
      method: "PATCH",
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/tags");
  return { success: true };
}

export async function deleteTagAction(tagId: string): Promise<ActionState> {
  try {
    await apiFetch(`/tags/${tagId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/tags");
  return { success: true };
}
