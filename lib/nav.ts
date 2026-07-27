import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ROLES } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hidden?: (role: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Blogs", href: "/blogs", icon: Newspaper },
  { label: "Categories", href: "/categories", icon: FolderTree },
  { label: "Tags", href: "/tags", icon: Tags },
  { label: "Media", href: "/media", icon: ImageIcon },
  // AUTHOR gets no users:* grant at all (not even read), unlike EDITOR.
  { label: "Users", href: "/users", icon: Users, hidden: (role) => role === ROLES.AUTHOR },
  {
    label: "Audit Log",
    href: "/audit",
    icon: ShieldCheck,
    hidden: (role) => role !== ROLES.ADMIN,
  },
];

export function navItemsForRole(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.hidden?.(role));
}
