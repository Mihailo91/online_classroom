import { requireRole } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AdminDashboard() {
  const user = await requireRole(["admin"]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Users</h3>
            <p className="mt-2 text-sm text-gray-600">Manage students & professors</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
            <p className="mt-2 text-sm text-gray-600">View all payments</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
            <p className="mt-2 text-sm text-gray-600">Manage video content</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            <p className="mt-2 text-sm text-gray-600">Analytics & insights</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-purple-50 p-4">
          <p className="text-sm text-purple-900">
            ✅ <strong>Authentication working!</strong> You are logged in as: {user.email} ({user.role})
          </p>
        </div>
      </div>
    </div>
  );
}
