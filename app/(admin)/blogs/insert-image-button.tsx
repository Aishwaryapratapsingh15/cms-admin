"use client";

import { useState, type RefObject } from "react";
import { ImagePlus } from "lucide-react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
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
import type { Media } from "@/lib/types";

export function InsertImageButton({
  media,
  editorRef,
}: {
  media: Media[];
  editorRef: RefObject<MDXEditorMethods | null>;
}) {
  const [open, setOpen] = useState(false);

  function insertImage(item: Media) {
    const markdown = `![${item.altText ?? item.originalName}](${item.url})`;
    editorRef.current?.insertMarkdown(markdown);
    setOpen(false);
    editorRef.current?.focus();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <ImagePlus className="size-4" />
        Insert image
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert an image</DialogTitle>
          <DialogDescription>
            Adds a markdown image tag at your cursor position in the content field.
          </DialogDescription>
        </DialogHeader>
        <MediaPickerGrid media={media} onSelect={insertImage} />
      </DialogContent>
    </Dialog>
  );
}
