"use client";

import { useState } from "react";
import { ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaPickerGrid } from "@/components/media-picker-grid";
import type { Blog, Media } from "@/lib/types";

export function FeaturedImagePicker({
  media,
  initial,
}: {
  media: Media[];
  initial: Blog["featuredMedia"];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Blog["featuredMedia"]>(initial);

  return (
    <div className="grid gap-2">
      <input type="hidden" name="featuredMediaId" value={selected?.id ?? ""} />
      <div className="flex items-center gap-3">
        {selected ? (
          <div className="relative w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.url}
              alt={selected.altText ?? ""}
              className="aspect-video w-full rounded-md border object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute -top-2 -right-2 rounded-full"
              aria-label="Remove featured image"
              onClick={() => setSelected(null)}
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="text-muted-foreground flex aspect-video w-40 items-center justify-center rounded-md border border-dashed text-xs">
            <ImageOff className="size-5" />
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button" variant="outline" />}>
            {selected ? "Change image" : "Choose image"}
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose a featured image</DialogTitle>
              <DialogDescription>
                From your media library. Upload new files from the Media page first.
              </DialogDescription>
            </DialogHeader>
            <MediaPickerGrid
              media={media}
              onSelect={(item) => {
                setSelected({
                  id: item.id,
                  s3Key: item.s3Key,
                  altText: item.altText,
                  width: item.width,
                  height: item.height,
                  url: item.url,
                });
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
