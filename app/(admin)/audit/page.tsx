import { apiFetch } from "@/lib/api-client";
import type { AuditLog, PaginatedResult } from "@/lib/types";
import { PaginationControls } from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityActionFilters } from "./entity-action-filters";

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOGIN: "outline",
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  PUBLISH: "default",
  UNPUBLISH: "secondary",
};

interface PageProps {
  searchParams: Promise<{ page?: string; entity?: string; action?: string }>;
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("limit", "20");
  if (params.entity) query.set("entity", params.entity);
  if (params.action) query.set("action", params.action);

  const result = await apiFetch<PaginatedResult<AuditLog>>(`/audit?${query.toString()}`);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-muted-foreground text-sm">{result.meta.total} total entries</p>
      </div>

      <EntityActionFilters />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  No audit entries found.
                </TableCell>
              </TableRow>
            )}
            {result.items.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{log.user?.fullName ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANT[log.action] ?? "outline"}>{log.action}</Badge>
                </TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {log.entityId ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {log.ipAddress ?? "—"}
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
