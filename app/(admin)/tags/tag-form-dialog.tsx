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
import { createTagAction, updateTagAction, type ActionState } from "@/lib/actions/tags";
import type { Tag } from "@/lib/types";

const initialState: ActionState = {};

export function TagFormDialog({
  tag,
  trigger,
}: {
  tag?: Tag;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = tag ? updateTagAction.bind(null, tag.id) : createTagAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(tag ? "Tag updated" : "Tag created");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Edit tag" : "New tag"}</DialogTitle>
          <DialogDescription>
            {tag
              ? "Renaming does not change the existing slug."
              : "Slug is auto-generated from the name if left blank."}
          </DialogDescription>
        </DialogHeader>
        <form key={tag?.updatedAt} action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={tag?.name} required maxLength={100} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={tag?.slug}
              placeholder="auto-generated if blank"
              maxLength={120}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : tag ? "Save changes" : "Create tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
