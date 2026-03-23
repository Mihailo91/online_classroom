/**
 * PayPal Mock Utilities
 * Provides mock responses for PayPal API calls for testing and development
 */

export interface MockPayPalOrderRequest {
  intent: "CAPTURE";
  purchase_units: Array<{
    reference_id: string;
    description: string;
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  application_context: {
    brand_name: string;
    landing_page: string;
    user_action: string;
    return_url: string;
    cancel_url: string;
  };
}

export interface MockPayPalCreateOrderResponse {
  id: string;
  status: "CREATED";
  links: Array<{
    rel: "approve" | "self" | "edit" | "capture" | "update";
    href: string;
    method?: string;
  }>;
}

export interface MockPayPalCaptureResponse {
  id: string;
  status: "COMPLETED" | "APPROVED" | "VOIDED" | "DECLINED";
  purchase_units: Array<{
    reference_id: string;
    shipping?: {
      name?: {
        full_name: string;
      };
    };
    payments: {
      captures: Array<{
        status: "COMPLETED" | "PENDING" | "FAILED";
        id: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: {
          status: string;
          dispute_categories: string[];
        };
        links: Array<{
          rel: string;
          href: string;
        }>;
      }>;
    };
  }>;
  payer: {
    email_address: string;
    payer_id: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
}

/**
 * Generate a mock PayPal order ID (similar format to real ones)
 */
export function generateMockPayPalOrderId(): string {
  return "MOCK-" + Math.random().toString(36).substr(2, 17).toUpperCase();
}

/**
 * Generate a mock PayPal payer email
 */
export function generateMockPayerEmail(): string {
  const randomNum = Math.random().toString(36).substr(2, 8);
  return `payer+${randomNum}@example.com`;
}

/**
 * Create a mock successful PayPal create order response
 */
export function createMockPayPalCreateOrderResponse(
  courseId: string,
  courseTitle: string,
  price: string,
  currency: string = "EUR"
): MockPayPalCreateOrderResponse {
  const orderId = generateMockPayPalOrderId();

  return {
    id: orderId,
    status: "CREATED",
    links: [
      {
        rel: "self",
        href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
        method: "GET",
      },
      {
        rel: "approve",
        href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
      },
      {
        rel: "update",
        href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
        method: "PATCH",
      },
      {
        rel: "capture",
        href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        method: "POST",
      },
    ],
  };
}

/**
 * Create a mock successful PayPal capture response
 */
export function createMockPayPalCaptureResponse(
  orderId: string,
  referenceId: string,
  amount: string,
  currency: string = "EUR",
  payerEmail?: string
): MockPayPalCaptureResponse {
  const email = payerEmail || generateMockPayerEmail();
  const captureId = "MOCK-CAPTURE-" + Math.random().toString(36).substr(2, 15).toUpperCase();

  return {
    id: orderId,
    status: "COMPLETED",
    purchase_units: [
      {
        reference_id: referenceId,
        shipping: {
          name: {
            full_name: "Mock Student User",
          },
        },
        payments: {
          captures: [
            {
              status: "COMPLETED",
              id: captureId,
              amount: {
                currency_code: currency,
                value: amount,
              },
              final_capture: true,
              seller_protection: {
                status: "ELIGIBLE",
                dispute_categories: ["ITEM_NOT_RECEIVED", "UNAUTHORIZED_TRANSACTION"],
              },
              links: [
                {
                  rel: "self",
                  href: `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}`,
                },
                {
                  rel: "refund",
                  href: `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`,
                },
              ],
            },
          ],
        },
      },
    ],
    payer: {
      email_address: email,
      payer_id: "MOCK-PAYER-" + Math.random().toString(36).substr(2, 10).toUpperCase(),
      name: {
        given_name: "Mock",
        surname: "Student",
      },
    },
  };
}

/**
 * Create mock PayPal responses for a course purchase
 */
export function createMockCoursePayPalFlow(
  courseId: string,
  courseTitle: string,
  price: number,
  currency: string = "EUR"
) {
  const priceStr = price.toFixed(2);
  const createOrderResponse = createMockPayPalCreateOrderResponse(
    courseId,
    courseTitle,
    priceStr,
    currency
  );

  const captureResponse = createMockPayPalCaptureResponse(
    createOrderResponse.id,
    courseId,
    priceStr,
    currency
  );

  return {
    orderId: createOrderResponse.id,
    approvalUrl: createOrderResponse.links.find((link) => link.rel === "approve")?.href || "",
    createOrderResponse,
    captureResponse,
  };
}

/**
 * Create mock PayPal responses for a lesson package purchase
 */
export function createMockLessonPayPalFlow(
  packageId: string,
  packageName: string,
  price: number,
  currency: string = "EUR"
) {
  const priceStr = price.toFixed(2);
  const createOrderResponse = createMockPayPalCreateOrderResponse(
    packageId,
    `Lesson Package: ${packageName}`,
    priceStr,
    currency
  );

  const captureResponse = createMockPayPalCaptureResponse(
    createOrderResponse.id,
    packageId,
    priceStr,
    currency
  );

  return {
    orderId: createOrderResponse.id,
    approvalUrl: createOrderResponse.links.find((link) => link.rel === "approve")?.href || "",
    createOrderResponse,
    captureResponse,
  };
}

/**
 * Mock a failed PayPal payment scenario
 */
export function createMockPayPalFailureResponse(
  orderId: string,
  referenceId: string,
  amount: string,
  currency: string = "EUR"
): MockPayPalCaptureResponse {
  return {
    id: orderId,
    status: "DECLINED",
    purchase_units: [
      {
        reference_id: referenceId,
        payments: {
          captures: [
            {
              status: "FAILED",
              id: "MOCK-FAILED-" + Math.random().toString(36).substr(2, 15).toUpperCase(),
              amount: {
                currency_code: currency,
                value: amount,
              },
              final_capture: false,
              seller_protection: {
                status: "NOT_ELIGIBLE",
                dispute_categories: [],
              },
              links: [],
            },
          ],
        },
      },
    ],
    payer: {
      email_address: generateMockPayerEmail(),
      payer_id: "MOCK-PAYER-" + Math.random().toString(36).substr(2, 10).toUpperCase(),
    },
  };
}
