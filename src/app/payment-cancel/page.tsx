"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { checkoutService } from "@/lib/services/checkout-service";
import Link from "next/link";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupComplete, setCleanupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && !cleanupComplete && !isCleaningUp) {
      handleCleanup();
    }
  }, [sessionId, cleanupComplete, isCleaningUp]);

  const handleCleanup = async () => {
    if (!sessionId) return;

    setIsCleaningUp(true);
    setError(null);

    try {
      await checkoutService.handlePaymentCancellation(sessionId);
      setCleanupComplete(true);
      console.log(
        "Order cleanup completed successfully. Stock has been unlocked."
      );
    } catch (err) {
      console.error("Error during cleanup:", err);
      setError(
        "Failed to clean up order. Please contact support if you see any charges."
      );
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your payment was cancelled and your order has been removed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isCleaningUp && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                Cleaning up your order...
              </p>
            </div>
          )}

          {cleanupComplete && (
            <div className="text-center py-4">
              <div className="mx-auto mb-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-green-600 font-medium">
                Order cleaned up successfully
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Return to Cart
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>No charges have been made to your account.</p>
            <p>You can try again anytime.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
