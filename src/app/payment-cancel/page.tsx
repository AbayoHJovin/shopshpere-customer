"use client";

import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-red-600">Payment Cancelled</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <ul className="space-y-2 text-muted-foreground">
              <li>• Your payment was not completed</li>
              <li>• No money was charged to your account</li>
              <li>• Your cart items are still available</li>
              <li>• You can try the payment again</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions or need assistance, please contact our support team.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Return to Cart
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
