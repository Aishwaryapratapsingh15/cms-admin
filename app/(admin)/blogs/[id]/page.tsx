import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { getCapabilities } from "@/lib/permissions";
import type { Blog, BlogVersion, Category, Media, PaginatedResult, Tag } from "@/lib/types";
import { BlogForm } from "../blog-form";
import { VersionHistory } from "../version-history";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [blog, categoriesResult, tagsResult, mediaResult, versions, currentUser] =
    await Promise.all([
      apiFetch<Blog>(`/blogs/${id}`),
      apiFetch<PaginatedResult<Category>>("/categories?limit=100"),
      apiFetch<PaginatedResult<Tag>>("/tags?limit=100"),
      apiFetch<PaginatedResult<Media>>("/media?limit=100"),
      apiFetch<BlogVersion[]>(`/blogs/${id}/versions`),
      getCurrentUser(),
    ]);
  const { canManageAllBlogs, canPublishBlogs } = getCapabilities(currentUser?.role.name);
  const canEdit = canManageAllBlogs || blog.author.id === currentUser?.id;

  if (!canEdit) {
    return (
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{blog.title}</h1>
        <p className="text-muted-foreground text-sm">
          You can only edit blogs you authored yourself.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{blog.title}</h1>
          <p className="text-muted-foreground text-sm">
            {blog.views.toLocaleString()} views · {blog.readingTime ?? "?"} min read
          </p>
        </div>
        <VersionHistory blogId={blog.id} versions={versions} />
      </div>
      <BlogForm
        blog={blog}
        categories={categoriesResult.items}
        tags={tagsResult.items}
        media={mediaResult.items}
        canPublish={canPublishBlogs}
      />
    </div>
  );
}
