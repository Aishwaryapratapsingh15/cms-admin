import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ user }: { user: User }) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div />
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{user.role.name}</Badge>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-sm leading-tight sm:block">
            <div className="font-medium">{user.fullName}</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Log out">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
