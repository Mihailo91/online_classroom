"use client";

import { useState } from "react";

interface PayPalButtonProps {
  courseId: string;
  price: number;
  currency: string;
}

export function PayPalButton({ courseId, price, currency }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(price);

  const handleApplyCoupon = async () => {
    setError(null);
    setCouponMessage(null);

    if (!couponCode.trim()) {
      setDiscountAmount(0);
      setFinalAmount(price);
      setCouponMessage("Enter a coupon code to apply a discount.");
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          referenceType: "course",
          originalAmount: price,
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Invalid coupon");
      }

      setDiscountAmount(data.discountAmount);
      setFinalAmount(data.finalAmount);
      setCouponCode(data.couponCode);
      setCouponMessage(`Coupon ${data.couponCode} applied successfully.`);
    } catch (err) {
      setDiscountAmount(0);
      setFinalAmount(price);
      setCouponMessage(null);
      setError(err instanceof Error ? err.message : "Failed to apply coupon");
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create PayPal order
      const response = await fetch(`/api/courses/${courseId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      const { approvalUrl } = await response.json();

      // Redirect to PayPal
      window.location.href = approvalUrl;
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err instanceof Error ? err.message : "Purchase failed");
      setLoading(false);
    }
  };

  const priceText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(finalAmount);

  const subtotalText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);

  const discountText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(discountAmount);

  return (
    <div>
      <div className="mb-4 space-y-3">
        <label className="block text-left text-sm font-medium text-gray-700">
          Coupon code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{subtotalText}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-gray-600">
          <span>Discount</span>
          <span>-{discountText}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{priceText}</span>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="mb-3 block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Buy Now - ${priceText}`}
      </button>

      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {couponMessage && (
        <div className="mt-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
          {couponMessage}
        </div>
      )}

      <p className="text-center text-xs text-gray-500">
        30-day money-back guarantee
      </p>
    </div>
  );
}
