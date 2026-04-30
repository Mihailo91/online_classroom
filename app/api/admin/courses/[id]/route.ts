import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    const course = await prisma.videoCourse.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { orderIndex: "asc" } },
        _count: { select: { studentCourses: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const revenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        referenceType: "course",
        referenceId: id,
        status: "completed",
      },
    });

    return NextResponse.json({
      ...course,
      enrollmentCount: course._count.studentCourses,
      revenue: revenue._sum.amount || 0,
    });
  } catch (error) {
    console.error("[GET /api/admin/courses/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const body = await request.json();
    const { title, description, thumbnailUrl, language, level, price, currency } = body;

    const course = await prisma.videoCourse.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(language !== undefined && { language }),
        ...(level !== undefined && { level }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
      },
      include: { modules: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[PUT /api/admin/courses/[id]]", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    await prisma.videoCourse.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/courses/[id]]", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
