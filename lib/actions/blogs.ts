"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Blog } from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function buildPayload(formData: FormData) {
  const getStr = (key: string) => {
    const v = formData.get(key);
    const s = v === null ? "" : String(v).trim();
    return s || undefined;
  };

  const status = getStr("status");
  // Already a UTC ISO string: the browser converts the picked local time (see
  // BlogForm). Converting here would use the server's timezone, not the editor's.
  const scheduledAt = getStr("scheduledAtIso");
  // Always sent explicitly (string id or null), never omitted: omitting the
  // key means "leave untouched" on PATCH (Prisma no-ops on `undefined`), which
  // would make clearing a previously-set featured image silently do nothing.
  const featuredMediaId = getStr("featuredMediaId") ?? null;

  // Same "omit vs empty array" distinction matters here: an empty array must
  // still be sent (it means "the user removed every FAQ"), only a missing/
  // unparseable hidden field should mean "leave FAQs untouched".
  let faqs: { question: string; answer: string }[] | undefined;
  const faqsRaw = formData.get("faqs");
  if (typeof faqsRaw === "string") {
    try {
      const parsed = JSON.parse(faqsRaw);
      if (Array.isArray(parsed)) {
        faqs = parsed
          .map((f) => ({
            question: String(f?.question ?? "").trim(),
            answer: String(f?.answer ?? "").trim(),
          }))
          .filter((f) => f.question && f.answer);
      }
    } catch {
      // Malformed JSON shouldn't happen (we control the hidden input), but
      // if it does, leave faqs undefined rather than wiping existing ones.
    }
  }

  return {
    title: String(formData.get("title") ?? ""),
    slug: getStr("slug"),
    excerpt: getStr("excerpt"),
    content: String(formData.get("content") ?? ""),
    status,
    scheduledAt: status === "SCHEDULED" ? scheduledAt : undefined,
    seoTitle: getStr("seoTitle"),
    seoDescription: getStr("seoDescription"),
    canonicalUrl: getStr("canonicalUrl"),
    ctaHeading: getStr("ctaHeading"),
    ctaDescription: getStr("ctaDescription"),
    ctaPrimaryText: getStr("ctaPrimaryText"),
    ctaPrimaryUrl: getStr("ctaPrimaryUrl"),
    ctaSecondaryText: getStr("ctaSecondaryText"),
    ctaSecondaryUrl: getStr("ctaSecondaryUrl"),
    isFeatured: formData.get("isFeatured") === "on",
    allowComments: formData.get("allowComments") === "on",
    featuredMediaId,
    categoryIds: formData.getAll("categoryIds").map(String),
    tagIds: formData.getAll("tagIds").map(String),
    faqs,
  };
}

export async function createBlogAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let blog: Blog;
  try {
    blog = await apiFetch<Blog>("/blogs", {
      method: "POST",
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/blogs");
  // redirect() throws internally, so the caller never sees `success: true`
  // to toast on — carry a flag through the URL instead, shown once on arrival
  // by BlogForm and then stripped.
  redirect(`/blogs/${blog.id}?created=1`);
}

export async function updateBlogAction(
  blogId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch<Blog>(`/blogs/${blogId}`, {
      method: "PATCH",
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blogId}`);
  return { success: true };
}

export async function deleteBlogAction(blogId: string): Promise<ActionState> {
  try {
    await apiFetch(`/blogs/${blogId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath("/blogs");
  return { success: true };
}

export async function rollbackBlogAction(
  blogId: string,
  versionId: string,
): Promise<ActionState> {
  try {
    await apiFetch<Blog>(`/blogs/${blogId}/versions/${versionId}/rollback`, {
      method: "POST",
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.detail };
    throw err;
  }

  revalidatePath(`/blogs/${blogId}`);
  return { success: true };
}
