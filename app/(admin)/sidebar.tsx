"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItemsForRole } from "@/lib/nav";
import { useUnsavedChangesGuard } from "./unsaved-changes-context";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { guardedNavigate } = useUnsavedChangesGuard();
  const items = navItemsForRole(role);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-muted/20 md:flex md:flex-col">
      <div className="px-4 py-5">
        <span className="text-lg font-semibold">EICE CMS</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                guardedNavigate(item.href, router);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
