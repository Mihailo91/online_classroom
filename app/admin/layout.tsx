import { requireRole } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin"]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar userName={user.name ?? ""} userEmail={user.email ?? ""} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-end border-b bg-white px-6 shadow-sm">
          <SignOutButton variant="compact" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
