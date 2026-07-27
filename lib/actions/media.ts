"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Media } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function uploadMediaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  try {
    await apiFetch<Media>("/media", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/media");
  return { success: true };
}

export async function updateMediaAction(
  mediaId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const altText = String(formData.get("altText") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();

  try {
    await apiFetch<Media>(`/media/${mediaId}`, {
      method: "PATCH",
      body: JSON.stringify({
        altText: altText || undefined,
        caption: caption || undefined,
      }),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/media");
  return { success: true };
}

export async function deleteMediaAction(mediaId: string): Promise<ActionState> {
  try {
    await apiFetch(`/media/${mediaId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/media");
  return { success: true };
}
