"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  updateCategoryAction,
  type ActionState,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

const initialState: ActionState = {};

export function CategoryFormDialog({
  category,
  trigger,
}: {
  category?: Category;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(category ? "Category updated" : "Category created");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Renaming does not change the existing slug."
              : "Slug is auto-generated from the name if left blank."}
          </DialogDescription>
        </DialogHeader>
        <form key={category?.updatedAt} action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={category?.name} required maxLength={150} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={category?.slug}
              placeholder="auto-generated if blank"
              maxLength={180}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="heading">Page heading</Label>
            <Input
              id="heading"
              name="heading"
              defaultValue={category?.heading ?? ""}
              maxLength={255}
              placeholder="Explore our Web Development insights"
            />
            <p className="text-muted-foreground text-xs">
              Shown on the public category page, below the category name. Falls back to
              default site copy if left blank.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={category?.description ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue={category?.color ?? "#3B82F6"}
                className="h-9 w-14 p-1"
              />
              <span className="text-muted-foreground text-sm">Hex color, e.g. #3B82F6</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : category ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
