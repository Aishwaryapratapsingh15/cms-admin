"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { deleteCategoryAction } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";
import { CategoryFormDialog } from "./category-form-dialog";

export function CategoryRowActions({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-1">
      <CategoryFormDialog
        category={category}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Edit category">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DeleteConfirmButton
        title={`Delete ${category.name}?`}
        description="This permanently removes the category. Blocked if it's still assigned to any blog."
        onConfirm={() => deleteCategoryAction(category.id)}
        successMessage="Category deleted"
      />
    </div>
  );
}
