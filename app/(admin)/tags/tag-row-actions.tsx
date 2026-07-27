"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { deleteTagAction } from "@/lib/actions/tags";
import type { Tag } from "@/lib/types";
import { TagFormDialog } from "./tag-form-dialog";

export function TagRowActions({ tag }: { tag: Tag }) {
  return (
    <div className="flex items-center gap-1">
      <TagFormDialog
        tag={tag}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Edit tag">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DeleteConfirmButton
        title={`Delete ${tag.name}?`}
        description="This permanently removes the tag. Blocked if it's still assigned to any blog."
        onConfirm={() => deleteTagAction(tag.id)}
        successMessage="Tag deleted"
      />
    </div>
  );
}
