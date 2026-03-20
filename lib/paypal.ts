/**
 * PayPal SDK Utilities
 * Uses PayPal Orders API v2 for course purchases
 */

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal order for course purchase
 */
export async function createPayPalOrder(
  courseId: string,
  courseTitle: string,
  price: number,
  currency: string = "EUR"
): Promise<{ id: string; approvalUrl: string }> {
  const accessToken = await getAccessToken();

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: courseId,
        description: `Course: ${courseTitle}`,
        amount: {
          currency_code: currency,
          value: price.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: "Online Language School",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${process.env.NEXTAUTH_URL}/api/courses/${courseId}/purchase/capture`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=cancelled`,
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal create order error:", error);
    throw new Error("Failed to create PayPal order");
  }

  const order = await response.json();

  // Find the approval URL
  const approvalUrl = order.links.find(
    (link: any) => link.rel === "approve"
  )?.href;

  if (!approvalUrl) {
    throw new Error("No approval URL in PayPal response");
  }

  return {
    id: order.id,
    approvalUrl,
  };
}

/**
 * Capture a PayPal order after user approval
 */
export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  payerEmail: string;
  referenceId: string;
  amount: number;
  currency: string;
}> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal capture error:", error);
    throw new Error("Failed to capture PayPal payment");
  }

  const captureData = await response.json();

  // Extract relevant data
  const purchaseUnit = captureData.purchase_units[0];
  const capture = purchaseUnit.payments.captures[0];

  return {
    id: captureData.id,
    status: captureData.status, // "COMPLETED"
    payerEmail: captureData.payer.email_address,
    referenceId: purchaseUnit.reference_id,
    amount: parseFloat(capture.amount.value),
    currency: capture.amount.currency_code,
  };
}

/**
 * Verify PayPal webhook signature (for future webhook implementation)
 */
export async function verifyWebhookSignature(
  webhookId: string,
  headers: Record<string, string>,
  body: any
): Promise<boolean> {
  const accessToken = await getAccessToken();

  const verificationData = {
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: webhookId,
    webhook_event: body,
  };

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationData),
    }
  );

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.verification_status === "SUCCESS";
}
