import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST /api/courses/[id]/modules/[moduleId]/progress - Save watch progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    const { id: courseId, moduleId } = await params;
    const body = await request.json();
    const { watchedSeconds, completed } = body;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify course purchase
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
        { error: "Course not purchased" },
        { status: 403 }
      );
    }

    // Upsert progress (create or update)
    const progress = await prisma.studentModuleProgress.upsert({
      where: {
        studentId_moduleId: {
          studentId: session.user.id,
          moduleId,
        },
      },
      update: {
        watchedSeconds: watchedSeconds || 0,
        completed: completed || false,
        lastWatchedAt: new Date(),
      },
      create: {
        studentId: session.user.id,
        moduleId,
        watchedSeconds: watchedSeconds || 0,
        completed: completed || false,
        lastWatchedAt: new Date(),
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
