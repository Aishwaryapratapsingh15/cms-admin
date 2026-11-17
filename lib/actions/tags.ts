"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { NameOption, PaginatedResult, Tag } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

// Trim + collapse inner whitespace so "Next  JS " can't dodge the backend's
// duplicate-name check (which normalizes the same way).
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildPayload(formData: FormData) {
  const name = normalizeName(String(formData.get("name") ?? ""));
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

// Backs both the "similar name exists" hint and the merge target picker.
export async function searchTagsAction(query: string): Promise<NameOption[]> {
  const params = new URLSearchParams({
    page: "1",
    limit: "8",
    sortBy: "name",
    sortOrder: "asc",
  });
  const search = normalizeName(query);
  if (search) params.set("search", search);

  try {
    const result = await apiFetch<PaginatedResult<Tag>>(`/tags?${params.toString()}`);
    return result.items.map(({ id, name, slug }) => ({ id, name, slug }));
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export async function mergeTagAction(
  sourceId: string,
  targetId: string,
): Promise<ActionState> {
  try {
    const result = await apiFetch<Tag & { movedBlogs: number }>(
      `/tags/${sourceId}/merge`,
      { method: "POST", body: JSON.stringify({ targetId }) },
    );
    revalidatePath("/tags");
    revalidatePath("/blogs");
    return {
      success: true,
      message: `Merged into “${result.name}” — ${result.movedBlogs} blog${
        result.movedBlogs === 1 ? "" : "s"
      } moved`,
    };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }
}
