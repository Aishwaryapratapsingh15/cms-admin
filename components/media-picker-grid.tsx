"use client";

import type { Media } from "@/lib/types";

export function MediaPickerGrid({
  media,
  onSelect,
}: {
  media: Media[];
  onSelect: (item: Media) => void;
}) {
  const images = media.filter((item) => item.mimeType.startsWith("image/"));

  if (images.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No images uploaded yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {images.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="focus-visible:ring-ring aspect-video overflow-hidden rounded-md border hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.altText ?? item.originalName}
            className="size-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
