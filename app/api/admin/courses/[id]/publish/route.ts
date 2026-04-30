import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const body = await request.json();
    const { isPublished } = body;

    const course = await prisma.videoCourse.update({
      where: { id },
      data: { isPublished },
      select: { id: true, isPublished: true },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[PATCH /api/admin/courses/[id]/publish]", error);
    return NextResponse.json({ error: "Failed to update publish status" }, { status: 500 });
  }
}
