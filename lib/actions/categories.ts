"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Category } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function buildPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  return {
    name,
    slug: slug || undefined,
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
