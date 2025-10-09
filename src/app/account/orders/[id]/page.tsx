"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  User,
  FileText,
  Check,
  X,
  Truck,
  Phone,
  Mail,
  QrCode,
  Download,
  CheckCircle,
  RotateCcw,
  Info,
  AlertCircle,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrderService, OrderDetailsResponse } from "@/lib/orderService";
import { ReturnService } from "@/lib/services/returnService";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import QRCode from "qrcode";

export default function AccountOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [hasReturnRequest, setHasReturnRequest] = useState<boolean>(false);
  const [checkingReturn, setCheckingReturn] = useState<boolean>(false);

  const generateQRCode = async (pickupToken: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(pickupToken, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const downloadQRCode = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded successfully");
  };

  const checkForReturnRequest = async (orderNumber: string) => {
    try {
      setCheckingReturn(true);
      const returnRequest = await ReturnService.getReturnByOrderNumber(orderNumber);
      setHasReturnRequest(!!returnRequest);
    } catch (error) {
      // No return request found or error - that's okay
      setHasReturnRequest(false);
    } finally {
      setCheckingReturn(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await OrderService.getOrderDetails(orderId);
        setOrder(orderData);

        // Generate QR code if pickup token exists
        if (orderData.pickupToken) {
          await generateQRCode(orderData.pickupToken);
        }

        // Check for return request
        if (orderData.orderNumber) {
          await checkForReturnRequest(orderData.orderNumber);
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("unauthorized");
        } else if (err.response?.status === 404) {
          setError("not_found");
        } else {
          setError("Failed to load order details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getDaysRemainingBadge = (item: any) => {
    if (!item.returnEligible) {
      return <Badge variant="destructive" className="ml-2">Return Expired</Badge>;
    }
    
    if (item.daysRemainingForReturn <= 3) {
      return <Badge variant="destructive" className="ml-2">{item.daysRemainingForReturn} days left</Badge>;
    } else if (item.daysRemainingForReturn <= 7) {
      return <Badge variant="secondary" className="ml-2">{item.daysRemainingForReturn} days left</Badge>;
    } else {
      return <Badge variant="outline" className="ml-2">{item.daysRemainingForReturn} days left</Badge>;
    }
  };

  const openInGoogleMaps = () => {
    if (order?.shippingAddress?.latitude && order?.shippingAddress?.longitude) {
      const url = `https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getDirections = () => {
    if (order?.shippingAddress?.latitude && order?.shippingAddress?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "READY_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Return eligibility logic
  const hasEligibleItems = order?.items?.some(item => item.returnEligible) || false;
  const isDelivered = order?.status?.toLowerCase() === 'delivered';
  const isProcessing = order?.status?.toLowerCase() === 'processing';
  const canRequestReturn = (isDelivered || isProcessing) && hasEligibleItems;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error === "unauthorized") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-6">
              <X className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to view order details.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account/orders">Back to Orders</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-6">
              <X className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  The order you're looking for doesn't exist or you don't have
                  permission to view it.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/account/orders">Back to Orders</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account">My Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-6">
              <X className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Error Loading Order</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/account/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">
                Order #{order.orderNumber}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
              {hasReturnRequest && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Return Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order Number
                      </p>
                      <p className="font-medium">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order Date
                      </p>
                      <p className="font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product?.images &&
                          item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name || "Product"}
                              className="w-full h-full object-cover"
                            />
                          ) : item.variant?.images &&
                            item.variant.images.length > 0 ? (
                            <img
                              src={item.variant.images[0]}
                              alt={item.variant.name || "Variant"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.variant?.name ||
                              item.product?.name ||
                              "Product"}
                          </h4>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">
                              Variant: {item.variant.name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(item.totalPrice)}
                          </p>
                          {getDaysRemainingBadge(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Return Request Section */}
            {canRequestReturn && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Return Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasReturnRequest ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have an active return request for this order.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        You can return eligible items from this order within the return window.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Return Policy</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Items can be returned within 30 days. Items must be in original condition with tags attached.
                        </p>
                      </div>
                      <Button 
                        onClick={() => {
                          router.push(`/returns/request?orderId=${order.id}`);
                        }}
                        className="w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Request Return
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Return Information for Non-Eligible Orders */}
            {!canRequestReturn && order?.items && order.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Return Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {!hasEligibleItems && (isDelivered || isProcessing) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          The return window for this order has expired. Items can only be returned within 30 days of the order date.
                        </AlertDescription>
                      </Alert>
                    )}
                    {!isDelivered && !isProcessing && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Returns can be requested once your order is processing or delivered.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">Return Policy</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Items can be returned within 30 days of the order date. Items must be in original condition with tags attached.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <p className="font-medium">
                      {order.shippingAddress.street}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.country}
                    </p>
                  </div>

                  {/* Google Maps Integration */}
                  {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                    <div className="space-y-3">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}&zoom=15`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Coordinates: {order.shippingAddress.latitude}, {order.shippingAddress.longitude}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={openInGoogleMaps}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open in Maps
                        </Button>
                        <Button
                          onClick={getDirections}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pickup Token QR Code */}
            {order.pickupToken && qrCodeDataUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Pickup Token QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Show this QR code when picking up your order. The QR code
                      contains your unique pickup token.
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

                    <div className="space-y-2 text-center">
                      <p className="text-sm font-medium">
                        Order Number: {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        Token: {order.pickupToken}
                      </p>
                    </div>

                    <Button
                      onClick={() =>
                        downloadQRCode(
                          qrCodeDataUrl,
                          `pickup-token-${order.orderNumber}.png`
                        )
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Order Placed</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.shipping && (
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{formatCurrency(order.shipping)}</span>
                    </div>
                  )}
                  {order.discount && (
                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(order.total || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {(order.paymentMethod || order.paymentStatus) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.paymentMethod && (
                      <div className="flex justify-between text-sm">
                        <span>Payment Method</span>
                        <span className="font-medium">
                          {order.paymentMethod}
                        </span>
                      </div>
                    )}
                    {order.paymentStatus && (
                      <div className="flex justify-between text-sm">
                        <span>Payment Status</span>
                        <Badge
                          variant={
                            order.paymentStatus === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/account/orders">View All Orders</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/account">My Account</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
