"use client";

import { useIsClient } from "@/lib/use-is-client";

// Formatted client-side so it uses the viewer's timezone; a server render
// would use the server's, producing a wrong time.
export function LocalDateTime({ value }: { value: string }) {
  const isClient = useIsClient();

  return (
    <span>
      {isClient
        ? new Date(value).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "…"}
    </span>
  );
}
