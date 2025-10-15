"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { OrderService, CheckoutVerificationResult } from "@/lib/orderService";
import { CartService } from "@/lib/cartService";
import Link from "next/link";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationResult, setVerificationResult] =
    useState<CheckoutVerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    const verifyOrder = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        const result = await OrderService.verifyCheckoutSession(sessionId);
        setVerificationResult(result);

        if (result.status === "paid") {
          // Clear cart on successful order
          await CartService.clearCart();
          toast.success("Order placed successfully!");
        } else {
          setError("Order verification failed");
          toast.error("Order verification failed");
        }
      } catch (error) {
        console.error("Error verifying order:", error);
        setError("Failed to verify order");
        toast.error("Failed to verify order");
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-muted-foreground">
          Verifying your order...
        </p>
      </div>
    );
  }

  if (error || verificationResult?.status !== "paid") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Verification Failed
            </h1>
            <p className="text-gray-600 mb-8">
              {error ||
                "We couldn't verify your order. Please contact support if you were charged."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/shop">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. We've received your order and will
            process it shortly.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Order Number:
              </span>
              <Badge variant="outline" className="font-mono">
                {verificationResult.order?.orderNumber || "N/A"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Payment Status:
              </span>
              <Badge variant="default" className="bg-green-600">
                {verificationResult.status || "Completed"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Payment Intent ID:
              </span>
              <span className="text-xs font-mono text-gray-500">
                {verificationResult.paymentIntentId}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-gray-600">
                  You'll receive an email confirmation with your order details
                  shortly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Processing</p>
                <p className="text-sm text-gray-600">
                  We'll prepare your items for shipping within 1-2 business
                  days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Shipping</p>
                <p className="text-sm text-gray-600">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Support Information */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Need help with your order?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/track-order">Track Order</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
