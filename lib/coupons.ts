import { DiscountType, ReferenceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ValidationParams = {
  code: string;
  referenceType: ReferenceType;
  originalAmount: number;
  currency: string;
  studentId?: string;
};

export type CouponValidationResult =
  | {
      valid: true;
      couponId: string;
      couponCode: string;
      discountAmount: number;
      finalAmount: number;
      originalAmount: number;
      currency: string;
      discountType: DiscountType;
    }
  | {
      valid: false;
      error: string;
    };

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export async function validateCoupon({
  code,
  referenceType,
  originalAmount,
  currency,
  studentId,
}: ValidationParams): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, error: "Coupon code is required." };
  }

  if (originalAmount <= 0) {
    return { valid: false, error: "Original amount must be greater than zero." };
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      code: normalizedCode,
    },
    include: {
      _count: {
        select: {
          redemptions: true,
        },
      },
    },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: "Coupon is invalid or inactive." };
  }

  const now = new Date();

  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, error: "Coupon is not active yet." };
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, error: "Coupon has expired." };
  }

  if (coupon.applicableTo && coupon.applicableTo !== referenceType) {
    return { valid: false, error: "Coupon does not apply to this purchase." };
  }

  if (
    coupon.maxTotalUses !== null &&
    coupon.maxTotalUses !== undefined &&
    coupon._count.redemptions >= coupon.maxTotalUses
  ) {
    return { valid: false, error: "Coupon usage limit has been reached." };
  }

  if (coupon.discountType === "fixed" && coupon.currency && coupon.currency !== currency) {
    return { valid: false, error: "Coupon currency does not match this purchase." };
  }

  if (studentId && coupon.maxUsesPerUser) {
    const userRedemptions = await prisma.couponRedemption.count({
      where: {
        couponId: coupon.id,
        studentId,
      },
    });

    if (userRedemptions >= coupon.maxUsesPerUser) {
      return { valid: false, error: "You have already used this coupon." };
    }
  }

  const rawDiscount =
    coupon.discountType === "percentage"
      ? (originalAmount * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);

  const discountAmount = Math.min(roundCurrency(rawDiscount), roundCurrency(originalAmount));
  const finalAmount = roundCurrency(originalAmount - discountAmount);

  if (discountAmount <= 0) {
    return { valid: false, error: "Coupon does not reduce this purchase amount." };
  }

  return {
    valid: true,
    couponId: coupon.id,
    couponCode: coupon.code,
    discountAmount,
    finalAmount,
    originalAmount: roundCurrency(originalAmount),
    currency,
    discountType: coupon.discountType,
  };
}
