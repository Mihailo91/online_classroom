import { NextResponse } from "next/server";
import { ReferenceType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { validateCoupon } from "@/lib/coupons";

const couponValidationSchema = z.object({
  code: z.string().trim().min(1),
  referenceType: z.nativeEnum(ReferenceType),
  originalAmount: z.number().positive(),
  currency: z.string().trim().length(3),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = couponValidationSchema.parse(await request.json());

    const result = await validateCoupon({
      code: payload.code,
      referenceType: payload.referenceType,
      originalAmount: payload.originalAmount,
      currency: payload.currency.toUpperCase(),
      studentId: session.user.id,
    });

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
