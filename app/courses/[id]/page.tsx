import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PayPalButton } from "@/components/payment/paypal-button";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

export default async function CourseLandingPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth();
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const previewQuery = resolvedSearchParams?.preview;

  // Fetch course with full details
  const course = await prisma.videoCourse.findUnique({
    where: { id, isPublished: true },
    include: {
      creator: {
        select: {
          name: true,
        },
      },
      modules: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
          durationSec: true,
          isPreview: true,
          vimeoVideoId: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
      studentCourses: {
        select: {
          studentId: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check if current user has purchased
  const hasPurchased =
    session?.user &&
    course.studentCourses.some((s) => s.studentId === session.user.id);

  // Calculate stats
  const totalDuration = course.modules.reduce(
    (sum, m) => sum + (m.durationSec || 0),
    0
  );
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  const previewModules = course.modules.filter((module) => module.isPreview);
  const activePreviewModule =
    previewModules.find((module) => module.id === previewQuery) ?? previewModules[0] ?? null;

  // Format price
  const priceText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: course.currency,
  }).format(Number(course.price));

  // Level badge color
  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4 flex items-center gap-2">
            {course.language && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {course.language}
              </span>
            )}
            {course.level && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  levelColors[course.level]
                }`}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            )}
          </div>

          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            {course.title}
          </h1>

          {course.description && (
            <p className="mb-4 text-lg text-gray-600">{course.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Instructor: {course.creator.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{durationText} total</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>{course.studentCourses.length} enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Course Details */}
          <div className="lg:col-span-2">
            {activePreviewModule && (
              <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Free preview
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      {activePreviewModule.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Watch this preview lesson before purchasing the full course.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700">
                    Preview available
                  </span>
                </div>

                <div className="overflow-hidden rounded-lg bg-black shadow-sm">
                  <div className="aspect-video">
                    <iframe
                      src={`https://player.vimeo.com/video/${activePreviewModule.vimeoVideoId}?dnt=1`}
                      title={`${activePreviewModule.title} preview`}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Course Modules */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Course Content
              </h2>
              <div className="rounded-lg border border-gray-200">
                {course.modules.map((module, index) => {
                  const modDuration = module.durationSec || 0;
                  const modMinutes = Math.floor(modDuration / 60);
                  const modSeconds = modDuration % 60;
                  const modDurationText =
                    modMinutes > 0
                      ? `${modMinutes}:${modSeconds.toString().padStart(2, "0")}`
                      : `${modSeconds}s`;

                  return (
                    <div
                      key={module.id}
                      className="border-b border-gray-200 p-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">{module.title}</div>
                            {module.isPreview ? (
                              <Link
                                href={`/courses/${course.id}?preview=${module.id}`}
                                className="text-xs font-medium text-blue-600 hover:underline"
                              >
                                Watch free preview
                              </Link>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Locked until purchase
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {module.isPreview && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Free Preview
                            </span>
                          )}
                          <span className="text-sm text-gray-500">{modDurationText}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
              <div className="mb-6 text-center">
                <div className="mb-2 text-4xl font-bold text-gray-900">
                  {priceText}
                </div>
                <div className="text-sm text-gray-600">One-time purchase</div>
              </div>

              {/* CTA based on auth state */}
              {!session?.user ? (
                // State 1: Not logged in
                <div>
                  <Link
                    href={`/login?callbackUrl=/courses/${course.id}`}
                    className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    Sign In to Enroll
                  </Link>
                  <p className="mt-4 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={`/register?callbackUrl=/courses/${course.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Register
                    </Link>
                  </p>
                </div>
              ) : hasPurchased ? (
                // State 3: Already purchased
                <div>
                  <div className="mb-4 flex items-center justify-center gap-2 text-green-600">
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">Enrolled</span>
                  </div>
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    Continue Learning →
                  </Link>
                </div>
              ) : (
                // State 2: Logged in, not purchased
                <PayPalButton
                  courseId={course.id}
                  price={Number(course.price)}
                  currency={course.currency}
                />
              )}

              {/* What's Included */}
              <div className="mt-6 border-t pt-6">
                <h3 className="mb-3 font-semibold text-gray-900">
                  This course includes:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{course.modules.length} video lessons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{durationText} on-demand video</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Access on mobile and desktop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Progress tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
