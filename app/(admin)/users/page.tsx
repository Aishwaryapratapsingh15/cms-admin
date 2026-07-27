import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/session";
import { ROLES } from "@/lib/constants";
import type { PaginatedResult, Role, User } from "@/lib/types";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { SortableHeader } from "@/components/sortable-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRowActions } from "./user-row-actions";
import { CreateUserDialog } from "./create-user-dialog";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("limit", "10");
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const [usersResult, roles, currentUser] = await Promise.all([
    apiFetch<PaginatedResult<User>>(`/users?${query.toString()}`),
    apiFetch<Role[]>("/roles"),
    getCurrentUser(),
  ]);

  const isAdmin = currentUser?.role.name === ROLES.ADMIN;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            {usersResult.meta.total} total
            {!isAdmin && " — read-only for your role"}
          </p>
        </div>
        {isAdmin && <CreateUserDialog roles={roles} />}
      </div>

      <SearchInput placeholder="Search by name or email..." />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader field="fullName" label="Name" />
              </TableHead>
              <TableHead>
                <SortableHeader field="email" label="Email" />
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortableHeader field="lastLogin" label="Last Login" />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersResult.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {usersResult.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.fullName}
                  {user.isFirstAdmin && (
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      (first admin — cannot be deleted)
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "outline" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                </TableCell>
                <TableCell>
                  <UserRowActions
                    user={user}
                    roles={roles}
                    canWrite={isAdmin}
                    canDelete={isAdmin}
                    isSelf={currentUser?.id === user.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={usersResult.meta.page} totalPages={usersResult.meta.totalPages} />
    </div>
  );
}
