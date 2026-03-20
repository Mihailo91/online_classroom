import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function TestAuthPage() {
  const session = await auth();
  
  // Test database connection
  let dbStatus = "Unknown";
  let userCount = 0;
  try {
    userCount = await prisma.user.count();
    dbStatus = "Connected";
  } catch (error) {
    dbStatus = "Error: " + (error as Error).message;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
        
        <div className="border-b pb-4">
          <h2 className="font-semibold text-lg mb-2">Session Status</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Logged In</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
                <p><strong>ID:</strong> {session.user?.id}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">❌ Not Logged In</p>
          )}
        </div>

        <div className="border-b pb-4">
          <h2 className="font-semibold text-lg mb-2">Database Connection</h2>
          <p className={dbStatus === "Connected" ? "text-green-600" : "text-red-600"}>
            {dbStatus === "Connected" ? "✅" : "❌"} {dbStatus}
          </p>
          {dbStatus === "Connected" && (
            <p className="text-sm text-gray-600 mt-1">
              Total users in database: {userCount}
            </p>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-lg mb-2">Test Actions</h2>
          <div className="space-y-2">
            <a href="/login" className="block px-4 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700">
              Go to Login Page
            </a>
            <a href="/register" className="block px-4 py-2 bg-green-600 text-white rounded text-center hover:bg-green-700">
              Go to Register Page
            </a>
            {session && (
              <a href="/dashboard" className="block px-4 py-2 bg-purple-600 text-white rounded text-center hover:bg-purple-700">
                Go to Dashboard
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
