"use client";

import { useState } from "react";

export default function CheckoutButton({
  courseId,
  locale,
}: {
  courseId: string;
  locale: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("CHECKOUT API RESPONSE:", data);

throw new Error(
  data.details
    ? JSON.stringify(data.details)
    : data.error || "Payment initialization failed",
);
      }

      const checkoutUrl =
        data.checkout?.checkout_url || data.checkout?.url;

      if (!checkoutUrl) {
        throw new Error("Payment URL was not returned");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong",
      );
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay with Edahabia"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}