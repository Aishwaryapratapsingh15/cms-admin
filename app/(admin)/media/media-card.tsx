"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { deleteMediaAction, updateMediaAction, type ActionState } from "@/lib/actions/media";
import type { Media } from "@/lib/types";

const initialState: ActionState = {};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCard({ media, canManage }: { media: Media; canManage: boolean }) {
  const isImage = media.mimeType.startsWith("image/");
  const [editOpen, setEditOpen] = useState(false);
  const boundUpdate = updateMediaAction.bind(null, media.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);

  useEffect(() => {
    if (state.success) {
      setEditOpen(false);
      toast.success("Media updated");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card className="overflow-hidden py-0">
      <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt={media.altText ?? media.originalName} className="size-full object-cover" />
        ) : (
          <FileText className="text-muted-foreground size-10" />
        )}
      </div>
      <CardContent className="px-3 pt-3">
        <p className="truncate text-sm font-medium" title={media.originalName}>
          {media.originalName}
        </p>
        <p className="text-muted-foreground text-xs">{formatBytes(media.fileSize)}</p>
      </CardContent>
      {canManage && (
        <CardFooter className="flex items-center justify-end gap-1 px-3 pb-3">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Edit media">
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit media details</DialogTitle>
                <DialogDescription>{media.originalName}</DialogDescription>
              </DialogHeader>
              <form action={formAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`altText-${media.id}`}>Alt text</Label>
                  <Input id={`altText-${media.id}`} name="altText" defaultValue={media.altText ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`caption-${media.id}`}>Caption</Label>
                  <Input id={`caption-${media.id}`} name="caption" defaultValue={media.caption ?? ""} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <DeleteConfirmButton
            title={`Delete ${media.originalName}?`}
            description="Removes the database record and the S3 object. Blocked if it's still used as a blog's featured image."
            onConfirm={() => deleteMediaAction(media.id)}
            successMessage="Media deleted"
          />
        </CardFooter>
      )}
    </Card>
  );
}
