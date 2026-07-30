"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchMediaAction, uploadMediaAction } from "@/lib/actions/media";
import type { Media } from "@/lib/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function MediaPickerGrid({
  media,
  onSelect,
}: {
  media: Media[];
  onSelect: (item: Media) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const found = await searchMediaAction(trimmed);
      setResults(found);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function uploadAndSelect(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("That file type isn't supported — use JPEG, PNG, WEBP, or GIF.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    setIsUploading(true);
    const result = await uploadMediaAction({}, formData);
    setIsUploading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.media) {
      toast.success("Uploaded");
      onSelect(result.media);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadAndSelect(file);
  }

  const images = (results ?? media).filter((item) => item.mimeType.startsWith("image/"));

  return (
    <div className="grid gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-3 rounded-lg border-2 border-dashed p-3 text-sm transition-colors",
          isDraggingOver ? "border-ring bg-accent" : "border-input",
        )}
      >
        <UploadCloud className="text-muted-foreground size-5 shrink-0" />
        <span className="text-muted-foreground flex-1">
          {isUploading ? "Uploading..." : "Drag a new image here, or"}
        </span>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) uploadAndSelect(file);
          }}
          className="w-auto"
        />
      </div>

      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename..."
          className="pl-8"
        />
      </div>

      {isSearching ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Searching...</p>
      ) : images.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {query ? "No images match your search." : "No images uploaded yet."}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              title={item.originalName}
              className="focus-visible:ring-ring flex flex-col overflow-hidden rounded-md border hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              <div className="aspect-video w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.altText ?? item.originalName}
                  className="size-full object-cover"
                />
              </div>
              <span className="bg-muted/40 truncate border-t px-1.5 py-1 text-left text-[11px] text-muted-foreground">
                {item.originalName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
