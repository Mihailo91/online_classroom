import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseLevel } from "@prisma/client";

// GET /api/courses - List all published courses (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const level = searchParams.get("level") as CourseLevel | null;
    const search = searchParams.get("search");

    const courses = await prisma.videoCourse.findMany({
      where: {
        isPublished: true,
        ...(language && { language }),
        ...(level && { level }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        modules: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            durationSec: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        _count: {
          select: {
            studentCourses: true, // Number of enrollments
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total duration for each course
    const coursesWithStats = courses.map((course) => ({
      ...course,
      moduleCount: course.modules.length,
      totalDuration: course.modules.reduce(
        (sum, module) => sum + (module.durationSec || 0),
        0
      ),
      enrollmentCount: course._count.studentCourses,
    }));

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
