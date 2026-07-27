import Link from "next/link";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { getCapabilities } from "@/lib/permissions";
import type { Blog, PaginatedResult } from "@/lib/types";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { SortableHeader } from "@/components/sortable-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusFilter } from "./status-filter";
import { BlogRowActions } from "./blog-row-actions";

const STATUS_VARIANT: Record<Blog["status"], "outline" | "secondary" | "default" | "destructive"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  SCHEDULED: "outline",
  ARCHIVED: "destructive",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
  }>;
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("limit", "10");
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.status) query.set("status", params.status);

  const [result, currentUser] = await Promise.all([
    apiFetch<PaginatedResult<Blog>>(`/blogs?${query.toString()}`),
    getCurrentUser(),
  ]);
  const { canManageAllBlogs, canDeleteBlogs } = getCapabilities(currentUser?.role.name);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blogs</h1>
          <p className="text-muted-foreground text-sm">{result.meta.total} total</p>
        </div>
        <Button nativeButton={false} render={<Link href="/blogs/new" />}>
          <Plus className="size-4" />
          New blog
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search blogs..." />
        <StatusFilter />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader field="title" label="Title" />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>
                <SortableHeader field="views" label="Views" />
              </TableHead>
              <TableHead>
                <SortableHeader field="publishedAt" label="Published" />
              </TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
            {result.items.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="max-w-xs font-medium">
                  <div className="flex items-center gap-2">
                    {blog.featuredMedia && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blog.featuredMedia.url}
                        alt=""
                        className="size-8 shrink-0 rounded object-cover"
                      />
                    )}
                    <Link href={`/blogs/${blog.id}`} className="truncate hover:underline">
                      {blog.title}
                    </Link>
                    {blog.isFeatured && (
                      <Badge variant="outline" className="shrink-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[blog.status]}>{blog.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{blog.author.fullName}</TableCell>
                <TableCell>{blog.views.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <BlogRowActions
                    blog={blog}
                    canEdit={canManageAllBlogs || blog.author.id === currentUser?.id}
                    canDelete={canDeleteBlogs}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={result.meta.page} totalPages={result.meta.totalPages} />
    </div>
  );
}
