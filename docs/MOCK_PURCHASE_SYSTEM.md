# PayPal Mock Purchase System

A complete mock system for testing course and lesson purchases without hitting real PayPal endpoints.

## Overview

This mock system includes:

- **`paypal.mock.ts`** - Mock PayPal API responses (create order, capture, failure scenarios)
- **`purchase.fixtures.ts`** - Realistic test data (courses, packages, professors, students, coupons)
- **`purchase.test-utils.ts`** - Complete purchase flow simulations with all steps
- **`purchase.examples.ts`** - 10 runnable examples showing how to use everything

## Quick Start

### 1. Mock a Successful Course Purchase

```typescript
import { createMockCoursePayPalFlow } from "@/lib/paypal.mock";

const flow = createMockCoursePayPalFlow(
  "course-id-123",
  "Spanish for Beginners",
  29.99,
  "EUR"
);

console.log("Order ID:", flow.orderId);
console.log("Approval URL:", flow.approvalUrl);
console.log("Capture Response:", flow.captureResponse);
```

### 2. Mock a Lesson Package Purchase with Coupon

```typescript
import { generateLessonPurchaseScenario } from "@/lib/purchase.fixtures";
import { createMockLessonPayPalFlow } from "@/lib/paypal.mock";

const scenario = generateLessonPurchaseScenario(
  "premium_pack",
  "maria-001",
  "john-001",
  "SUMMER20" // 20% discount coupon
);

const flow = createMockLessonPayPalFlow(
  scenario.package.id,
  scenario.package.name,
  scenario.finalAmount, // Already discounted
  scenario.package.currency
);

console.log("Original: €" + scenario.originalAmount);
console.log("Discount: €" + scenario.discount);
console.log("Final: €" + scenario.finalAmount);
```

### 3. Simulate Full Purchase Flow

```typescript
import { simulateCoursePurchaseFlow, printPurchaseFlow } from "@/lib/purchase.test-utils";

const flow = simulateCoursePurchaseFlow(
  "course-spanish-beginner-001",
  "student-john-001",
  "WELCOME10"
);

console.log(printPurchaseFlow(flow));
```

## File Structure

### `paypal.mock.ts`

Generates mock PayPal API responses.

**Key Functions:**

- `createMockPayPalCreateOrderResponse()` - Mock order creation response
- `createMockPayPalCaptureResponse()` - Mock payment capture response
- `createMockPayPalFailureResponse()` - Mock failed payment
- `createMockCoursePayPalFlow()` - Complete course purchase flow
- `createMockLessonPayPalFlow()` - Complete lesson purchase flow
- `generateMockPayPalOrderId()` - Generate realistic order ID
- `generateMockPayerEmail()` - Generate realistic payer email

**Example Response:**

```json
{
  "id": "MOCK-ABC123DEF456",
  "status": "COMPLETED",
  "purchase_units": [
    {
      "reference_id": "course-id-123",
      "payments": {
        "captures": [
          {
            "status": "COMPLETED",
            "amount": {
              "currency_code": "EUR",
              "value": "29.99"
            }
          }
        ]
      }
    }
  ],
  "payer": {
    "email_address": "payer+abc123@example.com"
  }
}
```

### `purchase.fixtures.ts`

Real-world test data that matches your database schema.

**Available Data:**

- `MOCK_COURSE_DATA` - 3 sample courses (Spanish, German, French)
- `MOCK_LESSON_PACKAGES` - 4 package types (Starter, Standard, Premium, Single)
- `MOCK_PROFESSORS` - 3 professors
- `MOCK_STUDENTS` - 2 students
- `MOCK_COUPONS` - 3 coupon codes (WELCOME10, LESSON15, SUMMER20)

**Helper Functions:**

- `generateCoursePurchaseScenario()` - Generate course purchase with auto discount calc
- `generateLessonPurchaseScenario()` - Generate lesson purchase with auto discount calc
- `getTestCase()` - Get pre-built test case by name
- `getAllTestCaseNames()` - List available test cases

**Available Test Cases:**

```
- course_no_coupon
- course_with_percentage_coupon
- course_with_fixed_coupon
- lesson_starter_no_coupon
- lesson_premium_with_coupon
- single_lesson_no_coupon
```

### `purchase.test-utils.ts`

Simulates complete 3-step purchase flows.

**Main Functions:**

- `simulateCoursePurchaseFlow()` - Full course purchase simulation
- `simulateLessonPurchaseFlow()` - Full lesson purchase simulation
- `simulateFailedPurchaseFlow()` - Failed payment scenario
- `printPurchaseFlow()` - Pretty print flow for debugging

**Flow Structure:**

Each flow includes:

1. **Step 1: Initiate Order** - POST request details and expected response
2. **Step 2: PayPal Approval** - URL where user approves payment
3. **Step 3: Capture Payment** - GET request to complete purchase
4. **Summary** - Total, discount, final amount, status

### `purchase.examples.ts`

10 runnable examples showing every use case.

**Examples:**

```typescript
exampleCoursePurchaseNoCoupon()
exampleCoursePurchaseWithCoupon()
exampleLessonPackagePurchase()
exampleLessonWithFixedCoupon()
exampleFullPurchaseFlowSimulation()
exampleAllTestCases()
exampleAccessMockData()
exampleUsingTestCaseByName()
exampleGenerateIdentifiers()
examplePaymentFailure()
```

## Common Use Cases

### Use Case 1: Testing Route Handlers

```typescript
// In your route test
import { createMockCoursePayPalFlow } from "@/lib/paypal.mock";

describe("POST /api/courses/[id]/purchase", () => {
  it("should create a purchase order", async () => {
    const mockFlow = createMockCoursePayPalFlow(
      "course-id",
      "Test Course",
      19.99
    );

    // Mock PayPal API
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockFlow.createOrderResponse))
    );

    // Call your route
    const response = await POST(request, { params: { id: "course-id" } });
    const data = await response.json();

    expect(data.orderId).toBe(mockFlow.orderId);
    expect(data.approvalUrl).toBe(mockFlow.approvalUrl);
  });
});
```

### Use Case 2: Testing with Coupons

```typescript
import { generateCoursePurchaseScenario } from "@/lib/purchase.fixtures";

const scenario = generateCoursePurchaseScenario(
  "spanish_beginner",
  "john-001",
  "WELCOME10"
);

// Verify discount was applied
expect(scenario.finalAmount).toBe(scenario.originalAmount * 0.9);
```

### Use Case 3: Testing Payment Failure

```typescript
import { simulateFailedPurchaseFlow } from "@/lib/purchase.test-utils";

const failedFlow = simulateFailedPurchaseFlow(
  "course-id",
  "student-id"
);

// Verify failure response
expect(failedFlow.step3_capturePayment.expectedResponse.status).toBe("failed");
```

### Use Case 4: Generating Documentation

```typescript
import { generatePurchaseFlowExamples, printPurchaseFlow } from "@/lib/purchase.test-utils";

const examples = generatePurchaseFlowExamples();

// Print all examples
Object.values(examples).forEach((flow) => {
  console.log(printPurchaseFlow(flow));
});
```

## Mock Data Reference

### Courses

| ID | Title | Price |
| --- | --- | --- |
| `course-spanish-beginner-001` | Spanish for Beginners | €29.99 |
| `course-german-advanced-001` | Advanced German Conversation | €49.99 |
| `course-french-business-001` | Business French | €39.99 |

### Lesson Packages

| ID | Name | Lessons | Validity | Price |
| --- | --- | --- | --- | --- |
| `package-starter-001` | Starter Pack | 4 | 30 days | €79.99 |
| `package-standard-001` | Standard Pack | 8 | 60 days | €149.99 |
| `package-premium-001` | Premium Pack | 12 | 90 days | €219.99 |
| `lesson-single-001` | Single Lesson | 1 | None | €25.00 |

### Coupons

| Code | Type | Value | Applies To |
| --- | --- | --- | --- |
| `WELCOME10` | Percentage | 10% | Course |
| `LESSON15` | Fixed | €15 | Package |
| `SUMMER20` | Percentage | 20% | All |

### Professors

| ID | Name | Language | Timezone |
| --- | --- | --- | --- |
| `prof-maria-001` | Maria García | Spanish | Europe/Madrid |
| `prof-stefan-001` | Stefan Mueller | German | Europe/Berlin |
| `prof-jean-001` | Jean Dupont | French | Europe/Paris |

### Students

| ID | Email | Name |
| --- | --- | --- |
| `student-john-001` | john.doe@example.com | John Doe |
| `student-jane-001` | jane.smith@example.com | Jane Smith |

## Integration with Route Handlers

### Replacing Real PayPal in Tests

```typescript
// Before: calls real PayPal
const { id, approvalUrl } = await createPayPalOrder(...);

// After: use mock
import { createMockCoursePayPalFlow } from "@/lib/paypal.mock";
const { orderId, approvalUrl } = createMockCoursePayPalFlow(...);
```

### Simulating Capture Flow

```typescript
import { createMockPayPalCaptureResponse } from "@/lib/paypal.mock";

// In your capture route test
const mockCapture = createMockPayPalCaptureResponse(
  orderId,
  courseId,
  "29.99"
);

// Verify capture logic
expect(mockCapture.status).toBe("COMPLETED");
```

## Extending the Mock System

### Adding a New Course

```typescript
// In purchase.fixtures.ts
export const MOCK_COURSE_DATA = {
  // ... existing courses
  italian_intermediate: {
    id: "course-italian-intermediate-001",
    title: "Italian Intermediate",
    price: 34.99,
    currency: "EUR",
    description: "Learn intermediate Italian",
  },
};
```

### Adding a New Coupon

```typescript
export const MOCK_COUPONS = [
  // ... existing coupons
  {
    code: "EASTER25",
    description: "25% off all items for Easter",
    discountType: "percentage",
    discountValue: 25,
    applicableTo: null, // applies to all
    maxUses: 300,
    maxUsesPerUser: 1,
  },
];
```

## Best Practices

1. **Use fixtures for test data** - Don't hardcode values; use `MOCK_COURSE_DATA`, `MOCK_LESSON_PACKAGES`, etc.
2. **Simulate complete flows** - Use `simulateCoursePurchaseFlow()` instead of individual response mocks
3. **Verify discount calculations** - Use `generateCoursePurchaseScenario()` to verify coupon math
4. **Test failure paths** - Use `simulateFailedPurchaseFlow()` for edge cases
5. **Keep mock realistic** - Mock IDs, emails, and response formats match real PayPal

## Running Examples

To see all examples in action:

```typescript
import { runAllExamples } from "@/lib/purchase.examples";

runAllExamples();
```

This will print formatted output for all 10 example scenarios.

## Troubleshooting

### Q: How do I test a specific coupon code?

```typescript
const scenario = generateCoursePurchaseScenario(
  "spanish_beginner",
  "john-001",
  "SUMMER20" // Pass the coupon code
);
```

### Q: How do I verify the discount was calculated correctly?

```typescript
const scenario = generateCoursePurchaseScenario(
  "spanish_beginner",
  "john-001",
  "WELCOME10"
);

expect(scenario.discount).toBe(scenario.originalAmount * 0.1);
expect(scenario.finalAmount).toBe(scenario.originalAmount - scenario.discount);
```

### Q: How do I get a complete flow for API docs?

```typescript
const flow = simulateCoursePurchaseFlow("course-id", "student-id");
console.log(printPurchaseFlow(flow, "Course Purchase Example"));
```

### Q: Can I use this in production?

No. This is for **development and testing only**. The mock system should never be enabled in production. Always use real PayPal in production environments.

---

**Created**: Spring 2026  
**Status**: Ready for use  
**Test Coverage**: All purchase scenarios covered
