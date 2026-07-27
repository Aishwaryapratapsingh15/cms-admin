import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { getCapabilities } from "@/lib/permissions";
import type { PaginatedResult, Tag } from "@/lib/types";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { SortableHeader } from "@/components/sortable-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagFormDialog } from "./tag-form-dialog";
import { TagRowActions } from "./tag-row-actions";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function TagsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("limit", "10");
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const [result, currentUser] = await Promise.all([
    apiFetch<PaginatedResult<Tag>>(`/tags?${query.toString()}`),
    getCurrentUser(),
  ]);
  const { canCreateTags, canManageTags } = getCapabilities(currentUser?.role.name);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tags</h1>
          <p className="text-muted-foreground text-sm">
            {result.meta.total} total
            {!canCreateTags && !canManageTags && " — read-only for your role"}
          </p>
        </div>
        {canCreateTags && (
          <TagFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                New tag
              </Button>
            }
          />
        )}
      </div>

      <SearchInput placeholder="Search tags..." />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader field="name" label="Name" />
              </TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>
                <SortableHeader field="createdAt" label="Created" />
              </TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                  No tags found.
                </TableCell>
              </TableRow>
            )}
            {result.items.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(tag.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {canManageTags && <TagRowActions tag={tag} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={result.meta.page} totalPages={result.meta.totalPages} />
    </div>
  );
}
