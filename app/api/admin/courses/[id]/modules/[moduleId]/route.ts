import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { moduleId } = await params;
    const body = await request.json();
    const { title, vimeoUrl, durationSec, isPreview, orderIndex } = body;

    let vimeoVideoId;
    if (vimeoUrl) {
      vimeoVideoId = vimeoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      if (!vimeoVideoId) {
        return NextResponse.json({ error: "Invalid Vimeo URL" }, { status: 400 });
      }
    }

    const courseModule = await prisma.courseModule.update({
      where: { id: moduleId },
      data: {
        ...(title !== undefined && { title }),
        ...(vimeoVideoId !== undefined && { vimeoVideoId, vimeoUrl }),
        ...(durationSec !== undefined && { durationSec }),
        ...(isPreview !== undefined && { isPreview }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });

    return NextResponse.json(courseModule);
  } catch (error) {
    console.error("[PUT /api/admin/courses/[id]/modules/[moduleId]]", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id: courseId, moduleId } = await params;

    await prisma.courseModule.delete({ where: { id: moduleId } });

    const remainingModules = await prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { orderIndex: "asc" },
    });

    await Promise.all(
      remainingModules.map((m, idx) =>
        prisma.courseModule.update({
          where: { id: m.id },
          data: { orderIndex: idx + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/courses/[id]/modules/[moduleId]]", error);
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
