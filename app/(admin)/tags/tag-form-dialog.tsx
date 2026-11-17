"use client";

import { useActionState, useState } from "react";
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
import {
  createTagAction,
  searchTagsAction,
  updateTagAction,
  type ActionState,
} from "@/lib/actions/tags";
import { SimilarNameHint, useSimilarNames } from "@/components/similar-name-hint";
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
  // Controlled so a failed submit doesn't reset it, and so the duplicate hint
  // can follow what's being typed.
  const [name, setName] = useState(tag?.name ?? "");
  const { exact, similar } = useSimilarNames(name, tag?.id, searchTagsAction, open);
  const action = tag ? updateTagAction.bind(null, tag.id) : createTagAction;
  // Close + toast run with the action's result here, not in an effect that
  // watches the returned state.
  const [, formAction, isPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await action(prev, formData);
      if (result.success) {
        setOpen(false);
        if (!tag) setName("");
        toast.success(tag ? "Tag updated" : "Tag created");
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState,
  );

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
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
            <SimilarNameHint noun="tag" exact={exact} similar={similar} />
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
            <Button type="submit" disabled={isPending || Boolean(exact)}>
              {isPending ? "Saving..." : tag ? "Save changes" : "Create tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
