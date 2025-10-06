"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  CreditCard,
  User,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  Navigation,
  Info,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { OrderService, OrderDetailsResponse } from "@/lib/orderService";
import { ReturnService } from "@/lib/services/returnService";

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = params.orderId as string;
  const token = searchParams.get('token');
  
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReturnRequest, setHasReturnRequest] = useState<boolean>(false);
  const [checkingReturn, setCheckingReturn] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError("No access token provided. Please use the link from your email.");
      setIsLoading(false);
      return;
    }

    if (!orderId) {
      setError("No order ID provided.");
      setIsLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId, token]);

  const fetchOrderDetails = async () => {
    if (!token || !orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const orderDetails = await OrderService.getOrderByTokenAndId(token, parseInt(orderId));
      setOrderDetails(orderDetails);

      // Check for return request
      if (orderDetails.orderNumber) {
        await checkForReturnRequest(orderDetails.orderNumber);
      }

      toast.success("Order details loaded successfully!");
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      setError(err.message || "Failed to load order details");
      toast.error(err.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
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

  const handleBackToOrders = () => {
    router.push(`/track-order?token=${encodeURIComponent(token || '')}`);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
    if (orderDetails?.shippingAddress?.latitude && orderDetails?.shippingAddress?.longitude) {
      const url = `https://www.google.com/maps?q=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getDirections = () => {
    if (orderDetails?.shippingAddress?.latitude && orderDetails?.shippingAddress?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}`;
      window.open(url, '_blank');
    }
  };

  const hasEligibleItems = orderDetails?.items?.some(item => item.returnEligible) || false;
  const isDelivered = orderDetails?.status?.toLowerCase() === 'delivered';
  const isProcessing = orderDetails?.status?.toLowerCase() === 'processing';
  const canRequestReturn = (isDelivered || isProcessing) && hasEligibleItems;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-muted-foreground">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleBackToOrders} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Order not found.</AlertDescription>
          </Alert>
          <Button onClick={handleBackToOrders} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
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
            onClick={handleBackToOrders} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order #{orderDetails.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(orderDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(orderDetails.status)}>
                {orderDetails.status}
              </Badge>
              {hasReturnRequest && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Return Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({orderDetails.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name || 'Product'}
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
                        <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
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
                          const token = searchParams.get('token');
                          if (token) {
                            router.push(`/returns/request?orderNumber=${orderDetails.orderNumber}&token=${encodeURIComponent(token)}`);
                          } else {
                            router.push(`/returns/request?orderNumber=${orderDetails.orderNumber}`);
                          }
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
            {!canRequestReturn && orderDetails?.items && orderDetails.items.length > 0 && (
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
          </div>

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
                <span>{formatCurrency(orderDetails.subtotal || 0)}</span>
              </div>
              {orderDetails.discount && orderDetails.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(orderDetails.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(orderDetails.shipping || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(orderDetails.tax || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(orderDetails.total || 0)}</span>
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
              {orderDetails.customerInfo && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{orderDetails.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{orderDetails.customerInfo.email}</span>
                  </div>
                  {orderDetails.customerInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{orderDetails.customerInfo.phone}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {orderDetails.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>

                {/* Google Maps Integration */}
                {orderDetails.shippingAddress.latitude && orderDetails.shippingAddress.longitude && (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${orderDetails.shippingAddress.latitude},${orderDetails.shippingAddress.longitude}&zoom=15`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Coordinates: {orderDetails.shippingAddress.latitude}, {orderDetails.shippingAddress.longitude}
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
          {orderDetails.paymentMethod && (
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
                  <span className="capitalize">{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <Badge variant={orderDetails.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                    {orderDetails.paymentStatus}
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
