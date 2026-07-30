import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { UnsavedChangesProvider } from "./unsaved-changes-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <UnsavedChangesProvider>
      <div className="flex min-h-svh">
        <Sidebar role={user.role.name} />
        <div className="flex flex-1 flex-col">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </UnsavedChangesProvider>
  );
}
