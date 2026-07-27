"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { rollbackBlogAction } from "@/lib/actions/blogs";
import type { BlogVersion } from "@/lib/types";

export function VersionHistory({ blogId, versions }: { blogId: string; versions: BlogVersion[] }) {
  const [open, setOpen] = useState(false);
  const [pendingId, startTransition] = useTransitionWithId();

  function handleRollback(versionId: string) {
    startTransition(versionId, async () => {
      const result = await rollbackBlogAction(blogId, versionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Rolled back to selected version");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <History className="size-4" />
            Version history ({versions.length})
          </Button>
        }
      />
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Snapshots are taken automatically whenever title, excerpt, or content changes. Rolling
            back creates a new version — it's not destructive.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {versions.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No edit history yet — this blog hasn't had a content change since creation.
            </p>
          )}
          {versions.map((version) => (
            <div key={version.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{version.title}</p>
                  <p className="text-muted-foreground text-xs">
                    Edited by {version.editedBy.fullName} on{" "}
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === version.id}
                  onClick={() => handleRollback(version.id)}
                >
                  {pendingId === version.id ? "Restoring..." : "Restore"}
                </Button>
              </div>
              {version.excerpt && (
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{version.excerpt}</p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useTransitionWithId() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function start(id: string, callback: () => Promise<void>) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await callback();
      } finally {
        setPendingId(null);
      }
    });
  }

  return [pendingId, start] as const;
}
