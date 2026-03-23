/**
 * MOCK PURCHASE ORDER EXAMPLES & REFERENCE
 *
 * This file demonstrates how to use the PayPal mock utilities and purchase fixtures
 * for testing the purchase flow without hitting real PayPal endpoints.
 */

import {
  createMockCoursePayPalFlow,
  createMockLessonPayPalFlow,
  generateMockPayPalOrderId,
  generateMockPayerEmail,
} from "./paypal.mock";

import {
  generateCoursePurchaseScenario,
  generateLessonPurchaseScenario,
  MOCK_COURSE_DATA,
  MOCK_LESSON_PACKAGES,
  MOCK_PROFESSORS,
  MOCK_STUDENTS,
  getTestCase,
} from "./purchase.fixtures";

import {
  simulateCoursePurchaseFlow,
  simulateLessonPurchaseFlow,
  simulateFailedPurchaseFlow,
  printPurchaseFlow,
  generatePurchaseFlowExamples,
} from "./purchase.test-utils";

/**
 * ============================================================
 * EXAMPLE 1: Mock a Successful Course Purchase (No Coupon)
 * ============================================================
 */
export function exampleCoursePurchaseNoCoupon() {
  console.log("\n--- Example 1: Course Purchase (No Coupon) ---\n");

  // Step 1: Generate mock PayPal responses for a course
  const flow = createMockCoursePayPalFlow(
    "course-spanish-beginner-001",
    "Spanish for Beginners",
    29.99,
    "EUR"
  );

  console.log("PayPal Order Created:");
  console.log("  Order ID:", flow.orderId);
  console.log("  Approval URL:", flow.approvalUrl);
  console.log("  Amount: €29.99");

  // Step 2: Customer approves on PayPal (happens in browser)
  console.log("\nCustomer approves payment on PayPal...");

  // Step 3: Server captures the payment with mock response
  console.log("\nCapture Response:");
  console.log("  Status:", flow.captureResponse.status);
  console.log("  Amount:", flow.captureResponse.purchase_units[0].payments.captures[0].amount);
  console.log("  Payer Email:", flow.captureResponse.payer.email_address);

  return flow;
}

/**
 * ============================================================
 * EXAMPLE 2: Mock a Course Purchase with Coupon
 * ============================================================
 */
export function exampleCoursePurchaseWithCoupon() {
  console.log("\n--- Example 2: Course Purchase (With 10% Coupon) ---\n");

  // Step 1: Calculate discount
  const scenario = generateCoursePurchaseScenario(
    "spanish_beginner",
    "john_doe",
    "WELCOME10"
  );

  console.log("Purchase Scenario:");
  console.log("  Course:", scenario.course.title);
  console.log("  Original Price: €" + scenario.originalAmount.toFixed(2));
  console.log("  Coupon Discount: -€" + scenario.discount.toFixed(2));
  console.log("  Final Amount: €" + scenario.finalAmount.toFixed(2));

  // Step 2: Create PayPal order with discounted amount
  const flow = createMockCoursePayPalFlow(
    scenario.course.id,
    scenario.course.title,
    scenario.finalAmount, // Use discounted amount
    scenario.course.currency
  );

  console.log("\nPayPal Order Created:");
  console.log("  Order ID:", flow.orderId);
  console.log("  Amount (after discount): €" + scenario.finalAmount.toFixed(2));

  return { scenario, flow };
}

/**
 * ============================================================
 * EXAMPLE 3: Mock a Lesson Package Purchase
 * ============================================================
 */
export function exampleLessonPackagePurchase() {
  console.log("\n--- Example 3: Lesson Package Purchase (Premium Pack) ---\n");

  // Step 1: Generate purchase scenario
  const scenario = generateLessonPurchaseScenario(
    "premium_pack",
    "maria_garcia",
    "john_doe"
  );

  console.log("Purchase Scenario:");
  console.log("  Package:", scenario.package.name);
  console.log("  Lessons:", scenario.package.lessons);
  console.log("  Validity:", scenario.package.validity_days, "days");
  console.log("  Professor:", scenario.professor.name);
  console.log("  Student:", scenario.student.name);
  console.log("  Price: €" + scenario.originalAmount.toFixed(2));

  // Step 2: Create PayPal order for lesson package
  const flow = createMockLessonPayPalFlow(
    scenario.package.id,
    scenario.package.name,
    scenario.finalAmount,
    scenario.package.currency
  );

  console.log("\nPayPal Order Created:");
  console.log("  Order ID:", flow.orderId);
  console.log("  Amount: €" + scenario.finalAmount.toFixed(2));

  return { scenario, flow };
}

/**
 * ============================================================
 * EXAMPLE 4: Mock Purchase with Fixed Amount Coupon
 * ============================================================
 */
export function exampleLessonWithFixedCoupon() {
  console.log("\n--- Example 4: Lesson Package with Fixed Discount Coupon ---\n");

  // Step 1: Calculate discount (€15 off)
  const scenario = generateLessonPurchaseScenario(
    "standard_pack",
    "stefan_mueller",
    "jane_smith",
    "LESSON15" // €15 off
  );

  console.log("Purchase Scenario:");
  console.log("  Package:", scenario.package.name);
  console.log("  Original Price: €" + scenario.originalAmount.toFixed(2));
  console.log("  Coupon (Fixed): -€" + scenario.discount.toFixed(2));
  console.log("  Final Amount: €" + scenario.finalAmount.toFixed(2));

  // Step 2: Create PayPal order
  const flow = createMockLessonPayPalFlow(
    scenario.package.id,
    scenario.package.name,
    scenario.finalAmount
  );

  console.log("\nPayPal Order Created:");
  console.log("  Order ID:", flow.orderId);
  console.log("  Amount: €" + scenario.finalAmount.toFixed(2));

  return { scenario, flow };
}

/**
 * ============================================================
 * EXAMPLE 5: Full Purchase Flow Simulation with All Steps
 * ============================================================
 */
export function exampleFullPurchaseFlowSimulation() {
  console.log("\n--- Example 5: Full Purchase Flow Simulation ---\n");

  const purchaseFlow = simulateCoursePurchaseFlow(
    "course-spanish-beginner-001",
    "student-john-001",
    "WELCOME10"
  );

  console.log(printPurchaseFlow(purchaseFlow, "Course Purchase Flow with Coupon"));

  return purchaseFlow;
}

/**
 * ============================================================
 * EXAMPLE 6: Simulate All Test Cases
 * ============================================================
 */
export function exampleAllTestCases() {
  console.log("\n--- Example 6: All Purchase Test Cases ---\n");

  const examples = generatePurchaseFlowExamples();

  Object.entries(examples).forEach(([testName, flow]) => {
    console.log(`\n${testName}:`);
    console.log(
      `  Type: ${flow.summary.type}`
    );
    console.log(`  Item: ${flow.summary.item}`);
    console.log(`  Amount: €${flow.summary.finalAmount.toFixed(2)}`);
    if (flow.summary.coupon) {
      console.log(`  Coupon: ${flow.summary.coupon}`);
    }
  });

  return examples;
}

/**
 * ============================================================
 * EXAMPLE 7: Accessing Mock Data Directly
 * ============================================================
 */
export function exampleAccessMockData() {
  console.log("\n--- Example 7: Accessing Mock Data Directly ---\n");

  console.log("Available Courses:");
  Object.entries(MOCK_COURSE_DATA).forEach(([key, course]) => {
    console.log(`  ${key}: ${course.title} (€${course.price})`);
  });

  console.log("\nAvailable Lesson Packages:");
  Object.entries(MOCK_LESSON_PACKAGES).forEach(([key, pkg]) => {
    console.log(`  ${key}: ${pkg.name} - ${pkg.lessons} lessons (€${pkg.price})`);
  });

  console.log("\nAvailable Professors:");
  Object.entries(MOCK_PROFESSORS).forEach(([key, prof]) => {
    console.log(`  ${key}: ${prof.name} - ${prof.language}`);
  });

  return {
    courses: MOCK_COURSE_DATA,
    packages: MOCK_LESSON_PACKAGES,
    professors: MOCK_PROFESSORS,
  };
}

/**
 * ============================================================
 * EXAMPLE 8: Using Test Case by Name
 * ============================================================
 */
export function exampleUsingTestCaseByName() {
  console.log("\n--- Example 8: Using Test Cases by Name ---\n");

  const testCase = getTestCase("course_with_percentage_coupon");

  console.log("Test Case: course_with_percentage_coupon");
  if ("course" in testCase) {
    console.log(`  Course: ${testCase.course.title}`);
  } else {
    console.log(`  Package: ${testCase.package.name}`);
  }
  console.log(`  Student: ${testCase.student.name}`);
  console.log(`  Coupon: ${testCase.coupon?.code}`);
  console.log(`  Original: €${testCase.originalAmount.toFixed(2)}`);
  console.log(`  Discount: €${testCase.discount.toFixed(2)}`);
  console.log(`  Final: €${testCase.finalAmount.toFixed(2)}`);

  return testCase;
}

/**
 * ============================================================
 * EXAMPLE 9: Generate Random Identifiers
 * ============================================================
 */
export function exampleGenerateIdentifiers() {
  console.log("\n--- Example 9: Generate Random Identifiers ---\n");

  const orderId = generateMockPayPalOrderId();
  const payerEmail = generateMockPayerEmail();

  console.log("Generated PayPal Order ID:", orderId);
  console.log("Generated Payer Email:", payerEmail);

  return { orderId, payerEmail };
}

/**
 * ============================================================
 * EXAMPLE 10: Payment Failure Scenario
 * ============================================================
 */
export function examplePaymentFailure() {
  console.log("\n--- Example 10: Payment Failure Scenario ---\n");

  const failureFlow = simulateFailedPurchaseFlow(
    "course-spanish-beginner-001",
    "student-john-001"
  );

  console.log(printPurchaseFlow(failureFlow, "Failed Purchase Flow"));
  console.log("\nFailure Reason:", failureFlow.step3_capturePayment.expectedResponse.status);

  return failureFlow;
}

/**
 * ============================================================
 * Quick Reference Table
 * ============================================================
 *
 * Mock PayPal Utilities:
 * - createMockPayPalCreateOrderResponse() → Creates mock "create order" response
 * - createMockPayPalCaptureResponse() → Creates mock "capture" response
 * - createMockPayPalFailureResponse() → Creates mock failed payment response
 * - createMockCoursePayPalFlow() → Complete flow for course purchases
 * - createMockLessonPayPalFlow() → Complete flow for lesson purchases
 *
 * Fixtures & Test Data:
 * - MOCK_COURSE_DATA → Course objects
 * - MOCK_LESSON_PACKAGES → Package objects
 * - MOCK_PROFESSORS → Professor objects
 * - MOCK_STUDENTS → Student objects
 * - MOCK_COUPONS → Coupon codes and details
 * - generateCoursePurchaseScenario() → Course scenario with discount calc
 * - generateLessonPurchaseScenario() → Lesson scenario with discount calc
 *
 * Simulation & Testing:
 * - simulateCoursePurchaseFlow() → Full 3-step course purchase
 * - simulateLessonPurchaseFlow() → Full 3-step lesson purchase
 * - simulateFailedPurchaseFlow() → Failed payment scenario
 * - printPurchaseFlow() → Format flow for console output
 *
 * Usage:
 * 1. Import the utilities you need
 * 2. Call the example functions or use the underlying utilities
 * 3. Pass mock responses to your route handlers
 * 4. Verify payment logic without hitting PayPal
 */

// Run all examples
export function runAllExamples() {
  try {
    exampleCoursePurchaseNoCoupon();
    exampleCoursePurchaseWithCoupon();
    exampleLessonPackagePurchase();
    exampleLessonWithFixedCoupon();
    exampleFullPurchaseFlowSimulation();
    exampleAllTestCases();
    exampleAccessMockData();
    exampleUsingTestCaseByName();
    exampleGenerateIdentifiers();
    examplePaymentFailure();
  } catch (error) {
    console.error("Error running examples:", error);
  }
}
