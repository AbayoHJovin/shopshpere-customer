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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            asChild
            className="mb-4"
          >
            <Link href="/account/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
              {order.returnRequest && (
                <Badge 
                  variant="outline" 
                  className={
                    order.returnRequest.status === "APPROVED"
                      ? "text-green-600 border-green-300"
                      : order.returnRequest.status === "DENIED"
                      ? "text-red-600 border-red-300"
                      : "text-orange-600 border-orange-300"
                  }
                >
                  Return: {order.returnRequest.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name || "Product"}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : item.variant?.images && item.variant.images.length > 0 ? (
                          <img
                            src={item.variant.images[0]}
                            alt={item.variant.name || "Variant"}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.product?.name || "Product"}
                        </h4>
                        {item.variant?.name && (
                          <p className="text-sm text-muted-foreground">
                            Variant: {item.variant.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-4 text-sm">
                            <span>Qty: {item.quantity}</span>
                            <span>Price: {formatCurrency(item.price)}</span>
                            <span className="font-medium">
                              Total: {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                          {getDaysRemainingBadge(item)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Return Request Section */}
          {order.returnRequest ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Return Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Return Request Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge
                        variant={
                          order.returnRequest.status === "APPROVED"
                            ? "default"
                            : order.returnRequest.status === "DENIED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.returnRequest.status}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Return Request Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="text-sm font-medium">{order.returnRequest.reason}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Submitted At</p>
                        <p className="text-sm">{formatDate(order.returnRequest.submittedAt)}</p>
                      </div>

                      {order.returnRequest.decisionAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">Decision Date</p>
                          <p className="text-sm">{formatDate(order.returnRequest.decisionAt)}</p>
                        </div>
                      )}

                      {order.returnRequest.decisionNotes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Decision Notes</p>
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <p className="text-sm">{order.returnRequest.decisionNotes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Appeal Section */}
                    {order.returnRequest.appeal ? (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Appeal Status
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge
                              variant={
                                order.returnRequest.appeal.status === "APPROVED"
                                  ? "default"
                                  : order.returnRequest.appeal.status === "DENIED"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {order.returnRequest.appeal.status}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Appeal Reason</p>
                            <p className="text-sm">{order.returnRequest.appeal.reason}</p>
                          </div>

                          {order.returnRequest.appeal.description && (
                            <div>
                              <p className="text-sm text-muted-foreground">Description</p>
                              <p className="text-sm">{order.returnRequest.appeal.description}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-sm text-muted-foreground">Submitted At</p>
                            <p className="text-sm">{formatDate(order.returnRequest.appeal.submittedAt)}</p>
                          </div>

                          {order.returnRequest.appeal.decisionAt && (
                            <div>
                              <p className="text-sm text-muted-foreground">Decision Date</p>
                              <p className="text-sm">{formatDate(order.returnRequest.appeal.decisionAt)}</p>
                            </div>
                          )}

                          {order.returnRequest.appeal.decisionNotes && (
                            <div>
                              <p className="text-sm text-muted-foreground">Decision Notes</p>
                              <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-sm">{order.returnRequest.appeal.decisionNotes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : order.returnRequest.canBeAppealed && order.returnRequest.status === "DENIED" ? (
                      <div className="mt-4 pt-4 border-t">
                        <Alert className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Your return request was denied. You can submit an appeal if you believe this decision was made in error.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={() => {
                            router.push(`/returns/appeal?returnRequestId=${order.returnRequest?.id}`);
                          }}
                          className="w-full"
                          variant="outline"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Submit Appeal
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : canRequestReturn ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Return Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ) : null}

          {/* Return Information for Non-Eligible Orders */}
          {!order.returnRequest && !canRequestReturn && order?.items && order.items.length > 0 && (
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

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal || 0)}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(order.total || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.customerInfo && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerInfo.email}</span>
                  </div>
                  {order.customerInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerInfo.phone}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

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
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>

                {/* Google Maps Integration with Satellite View */}
                {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}&zoom=18&maptype=satellite`}
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

          {/* Payment Information */}
          {order.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <Badge variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
