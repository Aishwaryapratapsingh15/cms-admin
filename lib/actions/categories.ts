"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Category, NameOption, PaginatedResult } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

// Trim + collapse inner whitespace so "Cloud  Computing " can't dodge the
// backend's duplicate-name check (which normalizes the same way).
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildPayload(formData: FormData) {
  const name = normalizeName(String(formData.get("name") ?? ""));
  const slug = String(formData.get("slug") ?? "").trim();
  const heading = String(formData.get("heading") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  return {
    name,
    slug: slug || undefined,
    heading: heading || undefined,
    description: description || undefined,
    color: color || undefined,
  };
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch<Category>(`/categories/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionState> {
  try {
    await apiFetch(`/categories/${categoryId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/categories");
  return { success: true };
}

// Backs both the "similar name exists" hint and the merge target picker.
export async function searchCategoriesAction(query: string): Promise<NameOption[]> {
  const params = new URLSearchParams({
    page: "1",
    limit: "8",
    sortBy: "name",
    sortOrder: "asc",
  });
  const search = normalizeName(query);
  if (search) params.set("search", search);

  try {
    const result = await apiFetch<PaginatedResult<Category>>(
      `/categories?${params.toString()}`,
    );
    return result.items.map(({ id, name, slug }) => ({ id, name, slug }));
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export async function mergeCategoryAction(
  sourceId: string,
  targetId: string,
): Promise<ActionState> {
  try {
    const result = await apiFetch<Category & { movedBlogs: number }>(
      `/categories/${sourceId}/merge`,
      { method: "POST", body: JSON.stringify({ targetId }) },
    );
    revalidatePath("/categories");
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
