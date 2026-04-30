import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireRole(["admin"]);

    const courses = await prisma.videoCourse.findMany({
      include: {
        modules: {
          select: { id: true, durationSec: true },
        },
        _count: {
          select: { studentCourses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const revenue = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            referenceType: "course",
            referenceId: course.id,
            status: "completed",
          },
        });

        return {
          ...course,
          moduleCount: course.modules.length,
          totalDuration: course.modules.reduce((sum, m) => sum + (m.durationSec || 0), 0),
          enrollmentCount: course._count.studentCourses,
          revenue: revenue._sum.amount || 0,
        };
      })
    );

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    console.error("[GET /api/admin/courses]", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["admin"]);
    const body = await request.json();
    const { title, description, thumbnailUrl, language, level, price, currency, modules } = body;

    const course = await prisma.videoCourse.create({
      data: {
        title,
        description,
        thumbnailUrl,
        language,
        level,
        price,
        currency: currency || "EUR",
        createdBy: user.id,
        isPublished: false,
        modules: modules?.length
          ? {
              create: modules.map((m: any, idx: number) => {
                const vimeoVideoId = m.vimeoUrl?.match(/vimeo\.com\/(\d+)/)?.[1];
                return {
                  title: m.title,
                  vimeoVideoId: vimeoVideoId || "",
                  vimeoUrl: m.vimeoUrl,
                  durationSec: m.durationSec,
                  isPreview: m.isPreview || false,
                  orderIndex: idx + 1,
                };
              }),
            }
          : undefined,
      },
      include: { modules: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[POST /api/admin/courses]", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
