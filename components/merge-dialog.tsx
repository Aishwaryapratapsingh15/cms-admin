"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Merge } from "lucide-react";
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
import type { NameOption } from "@/lib/types";

interface ActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

// Moves every blog from `source` onto a chosen target, then deletes `source`.
// Used to clean up duplicate categories/tags.
export function MergeDialog({
  noun,
  source,
  search,
  onMerge,
}: {
  noun: string;
  source: NameOption;
  search: (query: string) => Promise<NameOption[]>;
  onMerge: (targetId: string) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState<{ query: string; items: NameOption[] } | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isMerging, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const items = await search(query);
      if (!cancelled) setLoaded({ query, items });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query, search]);

  const options =
    loaded && loaded.query === query
      ? loaded.items.filter((item) => item.id !== source.id)
      : [];
  const isSearching = !loaded || loaded.query !== query;
  const target = options.find((item) => item.id === targetId) ?? null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setLoaded(null);
      setTargetId(null);
    }
  }

  function handleMerge() {
    if (!targetId) return;
    startTransition(async () => {
      const result = await onMerge(targetId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message ?? "Merged");
        handleOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Merge ${noun} into another`}>
            <Merge className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Merge “{source.name}” into another {noun}
          </DialogTitle>
          <DialogDescription>
            All blogs using “{source.name}” move to the {noun} you pick, then “{source.name}”
            is deleted. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${noun}s...`}
            aria-label={`Search ${noun}s`}
          />
          <div className="max-h-56 overflow-y-auto rounded-md border p-1">
            {isSearching && (
              <p className="text-muted-foreground p-2 text-sm">Searching...</p>
            )}
            {!isSearching && options.length === 0 && (
              <p className="text-muted-foreground p-2 text-sm">No other {noun}s found.</p>
            )}
            {!isSearching &&
              options.map((item) => (
                <label
                  key={item.id}
                  className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
                >
                  <input
                    type="radio"
                    name="merge-target"
                    value={item.id}
                    checked={targetId === item.id}
                    onChange={() => setTargetId(item.id)}
                    className="accent-primary"
                  />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground text-xs">{item.slug}</span>
                </label>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isMerging}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={!target || isMerging} onClick={handleMerge}>
            {isMerging ? "Merging..." : target ? `Merge into “${target.name}”` : "Merge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
