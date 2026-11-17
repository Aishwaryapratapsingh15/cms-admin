"use client";

import { useEffect, useState } from "react";
import type { NameOption } from "@/lib/types";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

// Debounced lookup of existing names while the admin types. `enabled` keeps
// closed dialogs (one per table row) from firing requests on page load.
export function useSimilarNames(
  name: string,
  excludeId: string | undefined,
  search: (query: string) => Promise<NameOption[]>,
  enabled: boolean,
) {
  const [result, setResult] = useState<{ query: string; items: NameOption[] }>({
    query: "",
    items: [],
  });

  useEffect(() => {
    const query = normalize(name);
    if (!enabled || !query) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const items = await search(query);
      if (!cancelled) setResult({ query, items });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name, enabled, search]);

  // Results for an older query are ignored until the new lookup lands.
  const current = normalize(name);
  const others =
    enabled && result.query === current
      ? result.items.filter((item) => item.id !== excludeId)
      : [];
  const exact = others.find((item) => item.name.toLowerCase() === current.toLowerCase());

  return { exact, similar: others.filter((item) => item !== exact) };
}

export function SimilarNameHint({
  noun,
  exact,
  similar,
}: {
  noun: string;
  exact?: NameOption;
  similar: NameOption[];
}) {
  if (exact) {
    return (
      <p className="text-destructive text-xs">
        A {noun} named “{exact.name}” already exists. Use it instead of creating a duplicate.
      </p>
    );
  }
  if (similar.length > 0) {
    return (
      <p className="text-muted-foreground text-xs">
        Similar {noun}s exist: {similar.map((item) => item.name).join(", ")}. Make sure
        you&apos;re not adding a duplicate.
      </p>
    );
  }
  return null;
}
