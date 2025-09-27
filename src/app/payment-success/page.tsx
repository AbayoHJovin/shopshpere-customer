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
  const [pointsUsed, setPointsUsed] = useState<number | null>(null);
  const [pointsValue, setPointsValue] = useState<number | null>(null);
  const [isPointsPayment, setIsPointsPayment] = useState(false);
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
    const orderId = searchParams.get("orderId");
    const orderNumber = searchParams.get("orderNumber");
    
    console.log("Payment success page loaded with session ID:", sessionId, "orderId:", orderId, "orderNumber:", orderNumber);

    if (sessionId) {
      // Handle Stripe payment verification
      verifyPayment(sessionId);
    } else if (orderNumber) {
      // Handle points-based payment - fetch order by orderNumber (preferred)
      fetchOrderDetailsByNumber(orderNumber);
    } else if (orderId) {
      // Fallback: Handle points-based payment - fetch order by orderId
      fetchOrderDetails(orderId);
    } else {
      setError("No session ID, order ID, or order number found");
      setVerifying(false);
      return;
    }
  }, [searchParams]);

  const fetchOrderDetailsByNumber = async (orderNumber: string) => {
    try {
      console.log("Fetching order details for orderNumber:", orderNumber);
      const orderDetails = await OrderService.getOrderDetailsByNumber(orderNumber);
      console.log("Order details result:", orderDetails);

      if (orderDetails) {
        // Set order details directly
        setOrderDetails(orderDetails);
        setIsPointsPayment(true);

        // Extract points information from URL parameters
        const pointsUsedParam = searchParams.get("pointsUsed");
        const pointsValueParam = searchParams.get("pointsValue");
        
        if (pointsUsedParam) {
          setPointsUsed(parseInt(pointsUsedParam));
        }
        if (pointsValueParam) {
          setPointsValue(parseFloat(pointsValueParam));
        }

        // Create a mock verification result for points-based payment
        setVerificationResult({
          status: "paid",
          amount: Math.round(orderDetails.total * 100), // Convert to cents
          currency: "usd",
          customerEmail: orderDetails.customerInfo?.email || "N/A",
          receiptUrl: null,
          paymentIntentId: `points_payment_${orderNumber}`,
          updated: true,
          order: orderDetails,
          paymentMethod: pointsUsedParam ? (parseFloat(pointsValueParam || "0") >= orderDetails.total ? "points" : "hybrid") : "unknown"
        });

        // Clear cart after successful payment
        try {
          localStorage.removeItem('cart');
          localStorage.removeItem('cartItems');
          console.log("Successfully cleared cart from localStorage");
        } catch (error) {
          console.error("Error clearing cart from localStorage:", error);
        }

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
      } else {
        throw new Error("Order not found");
      }
    } catch (err) {
      console.error("Order fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch order details");
    } finally {
      setVerifying(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      console.log("Fetching order details for orderId:", orderId);
      const orderDetails = await OrderService.getOrderById(orderId);
      console.log("Order details result:", orderDetails);

      if (orderDetails) {
        // Set order details directly
        setOrderDetails(orderDetails);
        setIsPointsPayment(true);

        // Extract points information from URL parameters or transaction data
        const pointsUsedParam = searchParams.get("pointsUsed");
        const pointsValueParam = searchParams.get("pointsValue");
        
        // Use transaction data if available, otherwise use URL params
        const transactionPointsUsed = orderDetails.transaction?.pointsUsed || 0;
        const transactionPointsValue = orderDetails.transaction?.pointsValue || 0;
        
        setPointsUsed(pointsUsedParam ? parseInt(pointsUsedParam) : transactionPointsUsed);
        setPointsValue(pointsValueParam ? parseFloat(pointsValueParam) : transactionPointsValue);

        // Create a verification result with transaction information
        setVerificationResult({
          status: orderDetails.transaction?.status === "COMPLETED" ? "paid" : "pending",
          amount: orderDetails.transaction?.orderAmount ? Math.round(orderDetails.transaction.orderAmount * 100) : Math.round(orderDetails.total * 100),
          currency: "rwf",
          customerEmail: orderDetails.customerInfo?.email || "N/A",
          receiptUrl: orderDetails.transaction?.receiptUrl || null,
          paymentIntentId: orderDetails.transaction?.stripePaymentIntentId || `order_payment_${orderId}`,
          updated: true,
          order: orderDetails,
          paymentMethod: orderDetails.transaction?.paymentMethod?.toLowerCase() || "unknown"
        });

        // Clear cart after successful payment
        try {
          localStorage.removeItem('cart');
          localStorage.removeItem('cartItems');
          console.log("Successfully cleared cart from localStorage");
        } catch (error) {
          console.error("Error clearing cart from localStorage:", error);
        }

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
      } else {
        throw new Error("Order not found");
      }
    } catch (err) {
      console.error("Order fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch order details");
    } finally {
      setVerifying(false);
    }
  };

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
          <h1 className="text-4xl font-bold mb-4 text-green-600">
            {isPointsPayment ? "Order Placed Successfully!" : "Payment Successful!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isPointsPayment 
              ? `Thank you for your order! ${pointsUsed ? `You used ${pointsUsed.toLocaleString()} points` : 'Payment processed'} and we will process your order shortly.`
              : "Thank you for your order. We've received your payment and will process your order shortly."
            }
          </p>
        </div>

        {/* Professional Invoice Layout */}
        {orderDetails && (
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg mb-8 print:shadow-none print:border-gray-400">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
                  <p className="text-blue-100">ShopSphere E-Commerce</p>
                  <p className="text-blue-100 text-sm">Order Confirmation & Receipt</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm text-blue-100">Invoice #</p>
                      <p className="font-mono font-bold text-lg">{orderDetails.orderNumber}</p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors print:hidden"
                    >
                      Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Invoice Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Bill To</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{orderDetails.customerInfo?.firstName} {orderDetails.customerInfo?.lastName}</p>
                    <p className="text-sm text-gray-600">{orderDetails.customerInfo?.email}</p>
                    <p className="text-sm text-gray-600">{orderDetails.customerInfo?.phoneNumber}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Ship To</h3>
                  <div className="space-y-1 text-sm">
                    <p>{orderDetails.shippingAddress?.street}</p>
                    {orderDetails.shippingAddress?.roadName && <p>{orderDetails.shippingAddress.roadName}</p>}
                    <p>{orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state}</p>
                    <p>{orderDetails.shippingAddress?.country}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Order Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize font-medium text-green-600">{orderDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="capitalize">{verificationResult?.paymentMethod || 'Card'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Items Purchased</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Description</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 w-20">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700 w-32">Unit Price</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700 w-32">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.items?.map((item: any, index: number) => {
                        const isVariant = item.variant && item.variant.name;
                        const displayName = isVariant ? item.variant?.name : item.product?.name;
                        const displayImage = isVariant ? item.variant?.images?.[0] : item.product?.images?.[0];
                        
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-3">
                                {displayImage && (
                                  <img
                                    src={displayImage}
                                    alt={displayName || 'Product'}
                                    className="w-12 h-12 object-cover rounded border flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 text-sm">
                                    {displayName || 'Unknown Product'}
                                  </p>
                                  {isVariant && item.product?.name && (
                                    <p className="text-xs text-gray-500">
                                      Base: {item.product.name}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {isVariant ? 'Product Variant' : 'Standard Product'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center font-medium">
                              {item.quantity}
                            </td>
                            <td className="py-4 px-2 text-right font-medium">
                              RWF {item.price?.toLocaleString() || '0'}
                            </td>
                            <td className="py-4 px-2 text-right font-bold">
                              RWF {item.totalPrice?.toLocaleString() || '0'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">RWF {orderDetails.subtotal?.toLocaleString() || '0'}</span>
                      </div>
                      {orderDetails.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">RWF {orderDetails.tax?.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      {orderDetails.shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium">RWF {orderDetails.shipping?.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      {orderDetails.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span className="font-medium">-RWF {orderDetails.discount?.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      
                      {/* Points Information */}
                      {((pointsUsed && pointsUsed > 0) || (orderDetails?.transaction?.pointsUsed && orderDetails.transaction.pointsUsed > 0)) && (
                        <>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between text-blue-600">
                              <span>Points Used:</span>
                              <span className="font-medium">
                                {(pointsUsed || orderDetails?.transaction?.pointsUsed || 0).toLocaleString()} pts
                              </span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                              <span>Points Value:</span>
                              <span className="font-medium">
                                -RWF {(pointsValue || orderDetails?.transaction?.pointsValue || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-800">
                          <span>Total Amount:</span>
                          <span>RWF {orderDetails.total?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {verificationResult && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Payment Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className="font-medium text-green-600 capitalize">{verificationResult.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="capitalize">{verificationResult.paymentMethod}</span>
                        </div>
                        {orderDetails?.transaction?.transactionRef && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-xs">{orderDetails.transaction.transactionRef}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>For questions about your order:</p>
                        <p>Email: support@shopsphere.com</p>
                        <p>Phone: +250 123 456 789</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}&zoom=16&maptype=satellite`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <a
                        href={`https://www.google.com/maps?q=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700 transition-colors"
                      >
                        Open in Google Maps
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-green-700 transition-colors"
                      >
                        Get Directions
                      </a>
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
