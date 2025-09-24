"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderService, OrderDetailsResponse, OrderItemResponse, SimpleProduct } from "@/lib/orderService";
import Link from "next/link";
import QRCode from "qrcode";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
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

        // Clear cart after successful payment
        try {
          // Clear localStorage cart for guest users
          localStorage.removeItem('cart');
          localStorage.removeItem('cartItems');
          console.log("Successfully cleared guest cart from localStorage");

        } catch (error) {
          console.error("Error clearing cart from localStorage:", error);
        }

        // Use order details directly from verification result
        if (result.order) {
          setOrderDetails(result.order);

          // Generate QR code with pickup token
          if (result.order.pickupToken) {
            const qrDataUrl = await QRCode.toDataURL(
              result.order.pickupToken,
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
              `pickup-token-${result.order.orderNumber}.png`
            );
          }
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4 text-green-600">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground">
            Thank you for your order. We've received your payment and will process your order shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {verificationResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
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

            {orderDetails?.customerInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{orderDetails.customerInfo.firstName} {orderDetails.customerInfo.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{orderDetails.customerInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{orderDetails.customerInfo.phoneNumber}</span>
                    </div>
                    {orderDetails.customerInfo.streetAddress && (
                      <div className="flex justify-between">
                        <span className="font-medium">Address:</span>
                        <span className="text-right">
                          {orderDetails.customerInfo.streetAddress}
                          {orderDetails.customerInfo.city && <><br />{orderDetails.customerInfo.city}</>}
                          {orderDetails.customerInfo.state && <>, {orderDetails.customerInfo.state}</>}
                          {orderDetails.customerInfo.country && <><br />{orderDetails.customerInfo.country}</>}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {orderDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Order Number:</span>
                      <span className="font-mono">{orderDetails.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Order Status:</span>
                      <span className="capitalize">{orderDetails.status}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${orderDetails.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        {orderDetails.tax > 0 && (
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${orderDetails.tax?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                        {orderDetails.shipping > 0 && (
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>${orderDetails.shipping?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                        {orderDetails.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-${orderDetails.discount?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>${orderDetails.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {orderDetails?.shippingAddress?.latitude && orderDetails?.shippingAddress?.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 w-full rounded-lg overflow-hidden border">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBcHNh-brnTF5rSAhZzi2AjBKRtum3JnDQ&q=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}&zoom=16&maptype=satellite`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Street:</span>
                        <span>{orderDetails.shippingAddress.street}</span>
                      </div>
                      {orderDetails.shippingAddress.roadName && (
                        <div className="flex justify-between">
                          <span className="font-medium">Road:</span>
                          <span>{orderDetails.shippingAddress.roadName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">City:</span>
                        <span>{orderDetails.shippingAddress.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">State:</span>
                        <span>{orderDetails.shippingAddress.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Country:</span>
                        <span>{orderDetails.shippingAddress.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Coordinates:</span>
                        <span className="text-xs font-mono">
                          {orderDetails.shippingAddress.latitude?.toFixed(6)}, {orderDetails.shippingAddress.longitude?.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Items Ordered ({orderDetails.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orderDetails.items.map((item: OrderItemResponse, index: number) => {
                      // Determine which product info to display (variant takes priority)
                      const displayProduct: SimpleProduct | undefined = item.variant || item.product;
                      const isVariant = !!item.variant;
                      
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {displayProduct?.images && displayProduct.images.length > 0 ? (
                              <img
                                src={displayProduct.images[0]}
                                alt={displayProduct?.name || 'Product'}
                                className="w-16 h-16 object-cover rounded-md border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.png';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {displayProduct?.name || 'Product'}
                            </p>
                            {isVariant && item.product?.name && (
                              <p className="text-xs text-muted-foreground truncate">
                                Base: {item.product.name}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {isVariant ? 'Product Variant' : 'Standard Product'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-sm">${item.totalPrice?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

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
              <Link href="/track-order">Track Order</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground">
            Please wait while we load your payment information.
          </p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
