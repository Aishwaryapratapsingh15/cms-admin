"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENTITIES = ["User", "Category", "Tag", "Blog", "Media"];
const ACTIONS = ["LOGIN", "CREATE", "UPDATE", "DELETE", "PUBLISH", "UNPUBLISH"];

export function EntityActionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={searchParams.get("entity") ?? "ALL"} onValueChange={(v) => setParam("entity", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All entities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All entities</SelectItem>
          {ENTITIES.map((entity) => (
            <SelectItem key={entity} value={entity}>
              {entity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("action") ?? "ALL"} onValueChange={(v) => setParam("action", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All actions</SelectItem>
          {ACTIONS.map((action) => (
            <SelectItem key={action} value={action}>
              {action}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
