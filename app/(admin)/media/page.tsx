import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { getCapabilities } from "@/lib/permissions";
import type { Media, PaginatedResult } from "@/lib/types";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { UploadDialog } from "./upload-dialog";
import { MediaCard } from "./media-card";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function MediaPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("limit", "20");
  if (params.search) query.set("search", params.search);

  const [result, currentUser] = await Promise.all([
    apiFetch<PaginatedResult<Media>>(`/media?${query.toString()}`),
    getCurrentUser(),
  ]);
  const { canManageAnyMedia } = getCapabilities(currentUser?.role.name);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media</h1>
          <p className="text-muted-foreground text-sm">{result.meta.total} total</p>
        </div>
        <UploadDialog />
      </div>

      <SearchInput placeholder="Search media by file name..." />

      {result.items.length === 0 ? (
        <div className="text-muted-foreground rounded-md border py-16 text-center text-sm">
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {result.items.map((media) => (
            <MediaCard key={media.id} media={media} canManage={canManageAnyMedia} />
          ))}
        </div>
      )}

      <PaginationControls page={result.meta.page} totalPages={result.meta.totalPages} />
    </div>
  );
}
