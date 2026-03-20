import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id] - Get course details (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await prisma.videoCourse.findUnique({
      where: {
        id,
        isPublished: true,
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
            isPreview: true,
            vimeoVideoId: true,
            vimeoUrl: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        _count: {
          select: {
            studentCourses: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalDuration = course.modules.reduce(
      (sum, module) => sum + (module.durationSec || 0),
      0
    );

    return NextResponse.json({
      ...course,
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        orderIndex: module.orderIndex,
        durationSec: module.durationSec,
        isPreview: module.isPreview,
        previewVideoId: module.isPreview ? module.vimeoVideoId : null,
        previewVideoUrl: module.isPreview ? module.vimeoUrl : null,
      })),
      moduleCount: course.modules.length,
      totalDuration,
      enrollmentCount: course._count.studentCourses,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
