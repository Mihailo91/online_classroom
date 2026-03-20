import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseGrid } from "@/components/course/course-grid";

export async function CourseShowcase() {
  // Fetch featured courses (max 6)
  const courses = await prisma.videoCourse.findMany({
    where: {
      isPublished: true,
    },
    include: {
      creator: {
        select: {
          name: true,
        },
      },
      modules: {
        select: {
          id: true,
          durationSec: true,
        },
      },
      studentCourses: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  // Transform data for CourseGrid
  const formattedCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    level: course.level,
    price: course.price,
    currency: course.currency,
    moduleCount: course.modules.length,
    totalDuration: course.modules.reduce(
      (sum, module) => sum + (module.durationSec || 0),
      0
    ),
    enrollmentCount: course.studentCourses.length,
  }));

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600">
            Start your language learning journey with our expert-led courses
          </p>
        </div>

        {/* Course Grid */}
        <CourseGrid
          courses={formattedCourses}
          emptyMessage="No courses available yet. Check back soon!"
        />

        {/* View All Button */}
        {formattedCourses.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
            >
              View All Courses →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
