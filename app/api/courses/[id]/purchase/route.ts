import { NextResponse } from "next/server";
import { ReferenceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createPayPalOrder } from "@/lib/paypal";
import { validateCoupon } from "@/lib/coupons";

const createPurchaseSchema = z.object({
  couponCode: z.string().trim().optional(),
});

// POST /api/courses/[id]/purchase - Create PayPal order
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: courseId } = await params;
    const body = createPurchaseSchema.parse(await request.json().catch(() => ({})));

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Course already purchased" },
        { status: 409 }
      );
    }

    // Get course details
    const course = await prisma.videoCourse.findUnique({
      where: { id: courseId, isPublished: true },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let finalAmount = Number(course.price);
    let discountAmount = 0;
    let couponId: string | null = null;
    let couponCode: string | null = null;

    if (body.couponCode) {
      const couponResult = await validateCoupon({
        code: body.couponCode,
        referenceType: ReferenceType.course,
        originalAmount: Number(course.price),
        currency: course.currency,
        studentId: session.user.id,
      });

      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 });
      }

      finalAmount = couponResult.finalAmount;
      discountAmount = couponResult.discountAmount;
      couponId = couponResult.couponId;
      couponCode = couponResult.couponCode;
    }

    // Create PayPal order
    const { id: paypalOrderId, approvalUrl } = await createPayPalOrder(
      course.id,
      course.title,
      finalAmount,
      course.currency
    );

    // Store pending transaction (optional - for tracking)
    await prisma.transaction.create({
      data: {
        studentId: session.user.id,
        amount: finalAmount,
        currency: course.currency,
        status: "pending",
        paymentMethod: "paypal",
        referenceType: "course",
        referenceId: course.id,
        couponId,
        couponCode,
        discountAmount,
        paypalOrderId,
      },
    });

    return NextResponse.json({
      orderId: paypalOrderId,
      approvalUrl,
      finalAmount,
      originalAmount: Number(course.price),
      discountAmount,
      couponCode,
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
