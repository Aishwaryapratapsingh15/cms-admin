import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { getCapabilities } from "@/lib/permissions";
import type { Category, Media, PaginatedResult, Tag } from "@/lib/types";
import { BlogForm } from "../blog-form";

export default async function NewBlogPage() {
  const [categoriesResult, tagsResult, mediaResult, currentUser] = await Promise.all([
    apiFetch<PaginatedResult<Category>>("/categories?limit=100"),
    apiFetch<PaginatedResult<Tag>>("/tags?limit=100"),
    apiFetch<PaginatedResult<Media>>("/media?limit=100"),
    getCurrentUser(),
  ]);
  const { canPublishBlogs } = getCapabilities(currentUser?.role.name);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">New blog</h1>
      <BlogForm
        categories={categoriesResult.items}
        tags={tagsResult.items}
        media={mediaResult.items}
        canPublish={canPublishBlogs}
      />
    </div>
  );
}
