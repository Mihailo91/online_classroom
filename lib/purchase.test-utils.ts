/**
 * Purchase Flow Testing Utilities
 * Simulates complete purchase flows for courses and lessons
 */

import {
  createMockCoursePayPalFlow,
  createMockLessonPayPalFlow,
  createMockPayPalFailureResponse,
} from "./paypal.mock";
import {
  generateCoursePurchaseScenario,
  generateLessonPurchaseScenario,
  MOCK_COURSE_DATA,
  MOCK_LESSON_PACKAGES,
} from "./purchase.fixtures";

export interface PurchaseFlowSimulation {
  step1_initiateOrder: {
    endpoint: string;
    method: string;
    body: any;
    expectedResponse: any;
  };
  step2_paypalApproval: {
    url: string;
    description: string;
  };
  step3_capturePayment: {
    endpoint: string;
    method: string;
    queryParams: {
      token: string;
    };
    expectedResponse: any;
  };
  summary: {
    type: string;
    item: string;
    amount: number;
    discount?: number;
    finalAmount: number;
    coupon?: string;
    status: string;
  };
}

/**
 * Simulate a complete course purchase flow
 */
export function simulateCoursePurchaseFlow(
  courseId: string,
  studentId: string,
  couponCode?: string
): PurchaseFlowSimulation {
  // Resolve course from ID
  const courseKey = Object.entries(MOCK_COURSE_DATA).find(
    ([_, course]) => course.id === courseId
  )?.[0] as keyof typeof MOCK_COURSE_DATA | undefined;

  if (!courseKey) {
    throw new Error(`Course "${courseId}" not found in fixtures`);
  }

  const scenario = generateCoursePurchaseScenario(
    courseKey,
    "john_doe" // fixed for testing
  );

  const paypalFlow = createMockCoursePayPalFlow(
    courseId,
    scenario.course.title,
    scenario.finalAmount,
    scenario.course.currency
  );

  return {
    step1_initiateOrder: {
      endpoint: `/api/courses/${courseId}/purchase`,
      method: "POST",
      body: {
        couponCode: couponCode || undefined,
      },
      expectedResponse: {
        orderId: paypalFlow.orderId,
        approvalUrl: paypalFlow.approvalUrl,
        finalAmount: scenario.finalAmount,
        originalAmount: scenario.originalAmount,
        discountAmount: scenario.discount,
        couponCode: couponCode || null,
      },
    },
    step2_paypalApproval: {
      url: paypalFlow.approvalUrl,
      description: "User approves payment on PayPal (happens in browser)",
    },
    step3_capturePayment: {
      endpoint: `/api/courses/${courseId}/purchase/capture`,
      method: "GET",
      queryParams: {
        token: paypalFlow.orderId,
      },
      expectedResponse: {
        redirectTo: `/dashboard/courses/${courseId}?purchased=true`,
        paypalResponse: paypalFlow.captureResponse,
      },
    },
    summary: {
      type: "course",
      item: scenario.course.title,
      amount: scenario.originalAmount,
      discount: scenario.discount > 0 ? scenario.discount : undefined,
      finalAmount: scenario.finalAmount,
      coupon: couponCode,
      status: "completed",
    },
  };
}

/**
 * Simulate a complete lesson package purchase flow
 */
export function simulateLessonPurchaseFlow(
  packageId: string,
  professorId: string,
  studentId: string,
  couponCode?: string
): PurchaseFlowSimulation {
  // Resolve package from ID
  const packageKey = Object.entries(MOCK_LESSON_PACKAGES).find(
    ([_, pkg]) => pkg.id === packageId
  )?.[0] as keyof typeof MOCK_LESSON_PACKAGES | undefined;

  if (!packageKey) {
    throw new Error(`Package "${packageId}" not found in fixtures`);
  }

  const scenario = generateLessonPurchaseScenario(
    packageKey,
    "maria_garcia", // fixed for testing
    "john_doe", // fixed for testing
    couponCode
  );

  const paypalFlow = createMockLessonPayPalFlow(
    packageId,
    scenario.package.name,
    scenario.finalAmount,
    scenario.package.currency
  );

  return {
    step1_initiateOrder: {
      endpoint: `/api/lessons/purchase`,
      method: "POST",
      body: {
        packageId,
        professorId,
        couponCode: couponCode || undefined,
      },
      expectedResponse: {
        orderId: paypalFlow.orderId,
        approvalUrl: paypalFlow.approvalUrl,
        finalAmount: scenario.finalAmount,
        originalAmount: scenario.originalAmount,
        discountAmount: scenario.discount,
        couponCode: couponCode || null,
      },
    },
    step2_paypalApproval: {
      url: paypalFlow.approvalUrl,
      description: "User approves payment on PayPal (happens in browser)",
    },
    step3_capturePayment: {
      endpoint: `/api/lessons/purchase/capture`,
      method: "GET",
      queryParams: {
        token: paypalFlow.orderId,
      },
      expectedResponse: {
        redirectTo: `/dashboard/lessons?purchased=true`,
        paypalResponse: paypalFlow.captureResponse,
      },
    },
    summary: {
      type: "lesson",
      item: `${scenario.package.name} with ${scenario.professor.name}`,
      amount: scenario.originalAmount,
      discount: scenario.discount > 0 ? scenario.discount : undefined,
      finalAmount: scenario.finalAmount,
      coupon: couponCode,
      status: "completed",
    },
  };
}

/**
 * Simulate a failed purchase flow
 */
export function simulateFailedPurchaseFlow(
  courseId: string,
  studentId: string
): Omit<PurchaseFlowSimulation, "step3_capturePayment"> & {
  step3_capturePayment: PurchaseFlowSimulation["step3_capturePayment"] & {
    expectedResponse: {
      status: "failed" | "error";
      redirectTo: string;
      paypalResponse: ReturnType<typeof createMockPayPalFailureResponse>;
    };
  };
} {
  const courseKey = Object.entries(MOCK_COURSE_DATA).find(
    ([_, course]) => course.id === courseId
  )?.[0] as keyof typeof MOCK_COURSE_DATA | undefined;

  if (!courseKey) {
    throw new Error(`Course "${courseId}" not found in fixtures`);
  }

  const scenario = generateCoursePurchaseScenario(
    courseKey,
    "john_doe"
  );

  const paypalFlow = createMockCoursePayPalFlow(
    courseId,
    scenario.course.title,
    scenario.finalAmount
  );

  const failureResponse = createMockPayPalFailureResponse(
    paypalFlow.orderId,
    courseId,
    scenario.finalAmount.toFixed(2)
  );

  return {
    step1_initiateOrder: {
      endpoint: `/api/courses/${courseId}/purchase`,
      method: "POST",
      body: {},
      expectedResponse: {
        orderId: paypalFlow.orderId,
        approvalUrl: paypalFlow.approvalUrl,
        finalAmount: scenario.finalAmount,
        originalAmount: scenario.originalAmount,
        discountAmount: 0,
      },
    },
    step2_paypalApproval: {
      url: paypalFlow.approvalUrl,
      description: "User goes through PayPal but payment is declined",
    },
    step3_capturePayment: {
      endpoint: `/api/courses/${courseId}/purchase/capture`,
      method: "GET",
      queryParams: {
        token: paypalFlow.orderId,
      },
      expectedResponse: {
        status: "failed",
        redirectTo: `/courses/${courseId}?payment=failed`,
        paypalResponse: failureResponse,
      },
    },
    summary: {
      type: "course",
      item: scenario.course.title,
      amount: scenario.originalAmount,
      finalAmount: scenario.finalAmount,
      status: "failed",
    },
  };
}

/**
 * Print a formatted purchase flow for debugging/documentation
 */
export function printPurchaseFlow(
  flow: PurchaseFlowSimulation,
  title: string = "Purchase Flow"
): string {
  const lines = [
    "\n" + "=".repeat(60),
    `${title}`,
    "=".repeat(60),
    "",
    "STEP 1: Initiate Purchase Order",
    `-`.repeat(40),
    `Endpoint: ${flow.step1_initiateOrder.endpoint}`,
    `Method: ${flow.step1_initiateOrder.method}`,
    `Body: ${JSON.stringify(flow.step1_initiateOrder.body, null, 2)}`,
    `Expected Response: ${JSON.stringify(flow.step1_initiateOrder.expectedResponse, null, 2)}`,
    "",
    "STEP 2: PayPal Approval (User Action)",
    `-`.repeat(40),
    `URL: ${flow.step2_paypalApproval.url}`,
    `Action: ${flow.step2_paypalApproval.description}`,
    "",
    "STEP 3: Capture Payment",
    `-`.repeat(40),
    `Endpoint: ${flow.step3_capturePayment.endpoint}`,
    `Method: ${flow.step3_capturePayment.method}`,
    `Query Params: ${JSON.stringify(flow.step3_capturePayment.queryParams, null, 2)}`,
    `Expected Response: ${JSON.stringify(flow.step3_capturePayment.expectedResponse, null, 2)}`,
    "",
    "SUMMARY",
    `-`.repeat(40),
    `Type: ${flow.summary.type}`,
    `Item: ${flow.summary.item}`,
    `Amount: ${flow.summary.amount}`,
    ...(flow.summary.discount ? [`Discount: -${flow.summary.discount}`] : []),
    `Final Amount: ${flow.summary.finalAmount}`,
    ...(flow.summary.coupon ? [`Coupon Applied: ${flow.summary.coupon}`] : []),
    `Status: ${flow.summary.status}`,
    "",
    "=".repeat(60),
  ];

  return lines.join("\n");
}

/**
 * Generate purchase flow examples for documentation
 */
export function generatePurchaseFlowExamples() {
  return {
    courseWithoutCoupon: simulateCoursePurchaseFlow(
      "course-spanish-beginner-001",
      "student-john-001"
    ),
    courseWithCoupon: simulateCoursePurchaseFlow(
      "course-spanish-beginner-001",
      "student-john-001",
      "WELCOME10"
    ),
    lessonWithoutCoupon: simulateLessonPurchaseFlow(
      "package-starter-001",
      "prof-maria-001",
      "student-john-001"
    ),
    lessonWithCoupon: simulateLessonPurchaseFlow(
      "package-premium-001",
      "prof-maria-001",
      "student-john-001",
      "SUMMER20"
    ),
    failedPurchase: simulateFailedPurchaseFlow(
      "course-spanish-beginner-001",
      "student-john-001"
    ),
  };
}
