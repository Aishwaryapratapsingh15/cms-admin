"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function SortableHeader({ field, label }: { field: string; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSortBy = searchParams.get("sortBy");
  const currentSortOrder = searchParams.get("sortOrder") ?? "desc";
  const isActive = currentSortBy === field;
  const nextOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";

  const params = new URLSearchParams(searchParams.toString());
  params.set("sortBy", field);
  params.set("sortOrder", nextOrder);
  params.delete("page");

  const Icon = isActive ? (currentSortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <Link
      href={`${pathname}?${params.toString()}`}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
    >
      {label}
      <Icon className="size-3.5" />
    </Link>
  );
}
