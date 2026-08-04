"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { User } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function setUserAvatarAction(
  userId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a photo to upload." };
  }

  try {
    await apiFetch<User>(`/users/${userId}/avatar`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/users");
  return { success: true };
}

export async function updateUserAction(
  userId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const designation = formData.get("designation");
  const roleId = formData.get("roleId");
  const password = formData.get("password");

  const payload: Record<string, unknown> = {
    fullName: String(fullName ?? ""),
    email: String(email ?? ""),
    designation: designation ? String(designation) : undefined,
    roleId: roleId ? String(roleId) : undefined,
    isActive: formData.get("isActive") === "on",
    // Blank means "leave unchanged" — never send an empty string to the API.
    password: password && String(password).length > 0 ? String(password) : undefined,
  };

  try {
    await apiFetch<User>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/users");
  return { success: true };
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const payload = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    roleId: String(formData.get("roleId") ?? ""),
  };

  try {
    await apiFetch<User>("/users/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  try {
    await apiFetch(`/users/${userId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/users");
  return { success: true };
}
