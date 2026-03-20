import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/courses/[id]/modules - Get course modules (authenticated + purchased only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has purchased the course
    const studentCourse = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
    });

    if (!studentCourse) {
      return NextResponse.json(
        { error: "Course not purchased. Please purchase the course to access modules." },
        { status: 403 }
      );
    }

    // Fetch modules with full details including Vimeo IDs
    const modules = await prisma.courseModule.findMany({
      where: {
        courseId,
      },
      include: {
        studentProgress: {
          where: {
            studentId: session.user.id,
          },
        },
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    // Format response with progress data
    const modulesWithProgress = modules.map((module) => ({
      id: module.id,
      title: module.title,
      orderIndex: module.orderIndex,
      vimeoVideoId: module.vimeoVideoId,
      vimeoUrl: module.vimeoUrl,
      durationSec: module.durationSec,
      progress: module.studentProgress[0] || {
        watchedSeconds: 0,
        completed: false,
        lastWatchedAt: null,
      },
    }));

    return NextResponse.json(modulesWithProgress);
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
