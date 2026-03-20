import { requireRole } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function StudentDashboard() {
  const user = await requireRole(["student"]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">My Packages</h3>
            <p className="mt-2 text-sm text-gray-600">View your active lesson packages</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Book a Lesson</h3>
            <p className="mt-2 text-sm text-gray-600">Schedule a 1-on-1 lesson</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
            <p className="mt-2 text-sm text-gray-600">Access your video courses</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            ✅ <strong>Authentication working!</strong> You are logged in as: {user.email} ({user.role})
          </p>
        </div>
      </div>
    </div>
  );
}
