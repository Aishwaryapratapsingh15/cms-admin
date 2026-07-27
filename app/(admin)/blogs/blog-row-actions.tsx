"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { deleteBlogAction } from "@/lib/actions/blogs";
import type { Blog } from "@/lib/types";

export function BlogRowActions({
  blog,
  canEdit,
  canDelete,
}: {
  blog: Blog;
  canEdit: boolean;
  canDelete: boolean;
}) {
  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-1">
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit blog"
          nativeButton={false}
          render={<Link href={`/blogs/${blog.id}`} />}
        >
          <Pencil className="size-4" />
        </Button>
      )}
      {canDelete && (
        <DeleteConfirmButton
          title={`Delete "${blog.title}"?`}
          description="This soft-deletes the blog. It will no longer appear publicly or in this list."
          onConfirm={() => deleteBlogAction(blog.id)}
          successMessage="Blog deleted"
        />
      )}
    </div>
  );
}
