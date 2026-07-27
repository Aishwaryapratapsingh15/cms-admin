import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { getCapabilities } from "@/lib/permissions";
import type { Category, PaginatedResult } from "@/lib/types";
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
import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryRowActions } from "./category-row-actions";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("limit", "10");
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const [result, currentUser] = await Promise.all([
    apiFetch<PaginatedResult<Category>>(`/categories?${query.toString()}`),
    getCurrentUser(),
  ]);
  const { canCreateCategories, canManageCategories } = getCapabilities(currentUser?.role.name);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground text-sm">
            {result.meta.total} total
            {!canCreateCategories && !canManageCategories && " — read-only for your role"}
          </p>
        </div>
        {canCreateCategories && (
          <CategoryFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                New category
              </Button>
            }
          />
        )}
      </div>

      <SearchInput placeholder="Search categories..." />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader field="name" label="Name" />
              </TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>
                <SortableHeader field="createdAt" label="Created" />
              </TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
            {result.items.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>
                  {category.color && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-4 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-muted-foreground text-xs">{category.color}</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {canManageCategories && <CategoryRowActions category={category} />}
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
