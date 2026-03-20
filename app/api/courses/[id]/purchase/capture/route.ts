import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { capturePayPalOrder } from "@/lib/paypal";

// GET /api/courses/[id]/purchase/capture?token=xxx - Capture PayPal payment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: courseId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token"); // PayPal order ID

    // Check authentication
    if (!session?.user) {
      return redirect(`/login?callbackUrl=/courses/${courseId}`);
    }

    if (!token) {
      return redirect(`/courses/${courseId}?payment=error`);
    }

    const course = await prisma.videoCourse.findUnique({
      where: { id: courseId, isPublished: true },
      select: {
        id: true,
      },
    });

    if (!course) {
      return redirect(`/courses/${courseId}?payment=error`);
    }

    // Check if already purchased (race condition protection)
    const existingPurchase = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
    });

    if (existingPurchase) {
      // Already purchased, redirect to watch page
      return redirect(`/dashboard/courses/${courseId}`);
    }

    // Capture the payment
    const captureResult = await capturePayPalOrder(token);

    if (captureResult.status !== "COMPLETED") {
      console.error("PayPal payment not completed:", captureResult);
      return redirect(`/courses/${courseId}?payment=failed`);
    }

    if (captureResult.referenceId !== courseId) {
      console.error("PayPal reference mismatch:", {
        expectedCourseId: courseId,
        paypalReferenceId: captureResult.referenceId,
      });
      return redirect(`/courses/${courseId}?payment=error`);
    }

    const pendingTransaction = await prisma.transaction.findFirst({
      where: {
        paypalOrderId: token,
        studentId: session.user.id,
        status: "pending",
        referenceType: "course",
        referenceId: courseId,
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        couponId: true,
        couponCode: true,
        discountAmount: true,
      },
    });

    if (!pendingTransaction) {
      console.error("Missing pending transaction for PayPal order:", token);
      return redirect(`/courses/${courseId}?payment=error`);
    }

    if (
      captureResult.amount !== Number(pendingTransaction.amount) ||
      captureResult.currency !== pendingTransaction.currency
    ) {
      console.error("PayPal amount mismatch:", {
        expectedAmount: Number(pendingTransaction.amount),
        paidAmount: captureResult.amount,
        expectedCurrency: pendingTransaction.currency,
        paidCurrency: captureResult.currency,
      });
      return redirect(`/courses/${courseId}?payment=error`);
    }

    const transaction = await prisma.transaction.update({
      where: {
        id: pendingTransaction.id,
      },
      data: {
        status: "completed",
      },
    });

    if (pendingTransaction.couponId && Number(pendingTransaction.discountAmount) > 0) {
      await prisma.couponRedemption.create({
        data: {
          couponId: pendingTransaction.couponId,
          studentId: session.user.id,
          transactionId: transaction.id,
          discountAmount: pendingTransaction.discountAmount,
        },
      });
    }

    // Grant access: create student_courses record
    await prisma.studentCourse.create({
      data: {
        studentId: session.user.id,
        courseId,
        transactionId: transaction.id,
      },
    });

    // Success! Redirect to watch page
    return redirect(`/dashboard/courses/${courseId}?purchased=true`);
  } catch (error) {
    console.error("Error capturing payment:", error);
    const { id: courseId } = await params;
    return redirect(`/courses/${courseId}?payment=error`);
  }
}
