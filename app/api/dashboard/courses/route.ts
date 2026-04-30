import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const studentId = session.user.id;
    const studentCourses = await prisma.studentCourse.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            modules: {
              select: { id: true, title: true, orderIndex: true, durationSec: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    const allModuleIds = studentCourses.flatMap((sc) => sc.course.modules.map((m) => m.id));
    const allProgress = await prisma.studentModuleProgress.findMany({
      where: { studentId, moduleId: { in: allModuleIds } },
      select: { moduleId: true, completed: true, lastWatchedAt: true },
    });

    const progressByModuleId = new Map(allProgress.map((p) => [p.moduleId, p]));

    const result = studentCourses.map((sc) => {
      const modules = sc.course.modules;
      const totalModules = modules.length;
      let completedModules = 0;
      let lastWatchedAt: Date | null = null;

      for (const mod of modules) {
        const progress = progressByModuleId.get(mod.id);
        if (progress) {
          if (progress.completed) completedModules++;
          if (progress.lastWatchedAt && (!lastWatchedAt || progress.lastWatchedAt > lastWatchedAt)) {
            lastWatchedAt = progress.lastWatchedAt;
          }
        }
      }

      const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

      return {
        id: sc.id,
        purchasedAt: sc.purchasedAt,
        _lastWatchedAt: lastWatchedAt,
        _purchasedAt: sc.purchasedAt,
        course: {
          id: sc.course.id,
          title: sc.course.title,
          description: sc.course.description,
          thumbnailUrl: sc.course.thumbnailUrl,
          language: sc.course.language,
          level: sc.course.level,
          price: sc.course.price,
          currency: sc.course.currency,
          totalModules,
          completedModules,
          progressPercent,
          lastWatchedAt,
        },
      };
    });

    result.sort((a, b) => {
      const aW = a._lastWatchedAt, bW = b._lastWatchedAt;
      if (aW && bW) return bW.getTime() - aW.getTime();
      if (aW) return -1;
      if (bW) return 1;
      return b._purchasedAt.getTime() - a._purchasedAt.getTime();
    });

    const response = result.map(({ _lastWatchedAt, _purchasedAt, ...rest }) => rest);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/dashboard/courses]", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
