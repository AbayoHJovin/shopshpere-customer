"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderService, OrderDetailsResponse } from "@/lib/orderService";
import Link from "next/link";
import QRCode from "qrcode";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(
    null
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    console.log("Payment success page loaded with session ID:", sessionId);

    if (!sessionId) {
      setError("No session ID found");
      setVerifying(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log("Starting payment verification for session:", sessionId);
      const result = await OrderService.verifyCheckoutSession(sessionId);
      console.log("Verification result:", result);

      if (result && result.status) {
        setVerificationResult(result);

        // Fetch order details to get the pickup token
        try {
          // We need to get the order ID from the verification result or find it another way
          // For now, let's assume we can get it from the session or we'll need to modify the verification result
          const orders = await OrderService.getUserOrders();
          const latestOrder = orders[0]; // Get the most recent order

          if (latestOrder) {
            const orderDetails = await OrderService.getOrderDetails(
              latestOrder.id
            );
            setOrderDetails(orderDetails);

            // Generate QR code with pickup token
            if (orderDetails.pickupToken) {
              const qrDataUrl = await QRCode.toDataURL(
                orderDetails.pickupToken,
                {
                  width: 256,
                  margin: 2,
                  color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                  },
                }
              );
              setQrCodeDataUrl(qrDataUrl);

              // Auto-download the QR code
              downloadQRCode(
                qrDataUrl,
                `pickup-token-${orderDetails.orderNumber}.png`
              );
            }
          }
        } catch (orderErr) {
          console.error("Error fetching order details:", orderErr);
          // Don't fail the entire process if we can't get order details
        }
      } else {
        throw new Error("Invalid verification result");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
        <p className="text-muted-foreground">
          Please wait while we confirm your payment.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-red-600">
          Payment Verification Failed
        </h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-green-600">
          Payment Successful!
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Thank you for your order. We've received your payment and will process
          your order shortly.
        </p>

        {verificationResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Payment Status:</span>
                  <span className="text-green-600 font-medium capitalize">
                    {verificationResult.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>
                    ${(verificationResult.amount / 100).toFixed(2)}{" "}
                    {verificationResult.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer Email:</span>
                  <span>{verificationResult.customerEmail || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Session ID:</span>
                  <span className="text-xs font-mono">
                    {verificationResult.sessionId}
                  </span>
                </div>
                {verificationResult.receiptUrl && (
                  <div className="flex justify-between">
                    <span className="font-medium">Receipt:</span>
                    <a
                      href={verificationResult.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pickup Token QR Code */}
        {orderDetails && qrCodeDataUrl && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Pickup Token QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Show this QR code when picking up your order. It has been
                  automatically downloaded to your device.
                </p>

                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={qrCodeDataUrl}
                      alt="Pickup Token QR Code"
                      className="border-2 border-gray-200 rounded-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Order Number: {orderDetails.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    Token: {orderDetails.pickupToken}
                  </p>
                </div>

                <Button
                  onClick={() =>
                    downloadQRCode(
                      qrCodeDataUrl,
                      `pickup-token-${orderDetails.orderNumber}.png`
                    )
                  }
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <p className="text-muted-foreground">
            You will receive an email confirmation with your order details
            shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
