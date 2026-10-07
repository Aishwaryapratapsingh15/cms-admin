"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Re-sync the box when the URL's search param changes externally (back/
  // forward, "clear filters"). Done during render, not in an effect, so there
  // is no extra render with a stale value.
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setValue(urlSearch);
  }

  function handleChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("search", next);
      } else {
        params.delete("search");
      }
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 350);
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
