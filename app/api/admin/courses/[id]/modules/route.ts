import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id: courseId } = await params;
    const body = await request.json();
    const { title, vimeoUrl, durationSec, isPreview } = body;

    const vimeoVideoId = vimeoUrl?.match(/vimeo\.com\/(\d+)/)?.[1];
    if (!vimeoVideoId) {
      return NextResponse.json({ error: "Invalid Vimeo URL" }, { status: 400 });
    }

    const maxOrder = await prisma.courseModule.aggregate({
      _max: { orderIndex: true },
      where: { courseId },
    });

    const courseModule = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        vimeoVideoId,
        vimeoUrl,
        durationSec,
        isPreview: isPreview || false,
        orderIndex: (maxOrder._max.orderIndex || 0) + 1,
      },
    });

    return NextResponse.json(courseModule);
  } catch (error) {
    console.error("[POST /api/admin/courses/[id]/modules]", error);
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}
