"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
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
import { uploadMediaAction, type ActionState } from "@/lib/actions/media";

const initialState: ActionState = {};

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(uploadMediaAction, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success("Media uploaded");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Upload
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>
            JPEG, PNG, WEBP, GIF, or PDF — up to 10MB.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            />
            <p className="text-muted-foreground text-xs">
              Recommended: at least 1200×675px (16:9), landscape orientation. This image
              gets cropped to different shapes across the site (wide cards, hero
              banners), so a larger landscape source crops cleanly everywhere — a small
              or portrait image will look pixelated or badly cropped.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="altText">Alt text</Label>
            <Input id="altText" name="altText" placeholder="Describes the image for accessibility" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" name="caption" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              <Upload className="size-4" />
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
