"use client";

import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, UploadCloud } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { uploadMediaAction, type ActionState } from "@/lib/actions/media";

const initialState: ActionState = {};
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  // Close + toast run with the action's result here, not in an effect that
  // watches the returned state.
  const [, formAction, isPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await uploadMediaAction(prev, formData);
      if (result.success) {
        setOpen(false);
        setSelectedFileName(null);
        toast.success("Media uploaded");
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState,
  );

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("That file type isn't supported — use JPEG, PNG, WEBP, GIF, or PDF.");
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
    setSelectedFileName(file.name);
  }

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
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                isDraggingOver ? "border-ring bg-accent" : "border-input",
              )}
            >
              <UploadCloud className="text-muted-foreground size-6" />
              <p className="text-muted-foreground text-sm">
                {selectedFileName ? (
                  <span className="text-foreground font-medium">{selectedFileName}</span>
                ) : (
                  <>Drag and drop a file here, or</>
                )}
              </p>
              <Input
                ref={fileInputRef}
                id="file"
                name="file"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? null)}
                className="w-auto"
              />
            </div>
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
