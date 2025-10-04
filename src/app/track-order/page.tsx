"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Send,
  Shield,
  ArrowRight,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  CreditCard,
  User,
  Phone,
  Clock,
  AlertCircle,
  FileText,
  KeyRound,
  Timer,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { OrderService, OrderDetailsResponse, OrderTrackingRequest, OrderSummary } from "@/lib/orderService";
import { ReturnService } from "@/lib/services/returnService";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
  const [ordersList, setOrdersList] = useState<OrderSummary[]>([]);
  const [showOrdersList, setShowOrdersList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReturnRequest, setHasReturnRequest] = useState<boolean>(false);
  const [checkingReturn, setCheckingReturn] = useState<boolean>(false);
  const [accessRequested, setAccessRequested] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);

  // Check if token is provided in URL on component mount
  useEffect(() => {
    if (tokenFromUrl) {
      handleTokenVerification(tokenFromUrl);
    }
  }, [tokenFromUrl]);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsRequestingAccess(true);
    setError(null);

    try {
      const request: OrderTrackingRequest = { email: email.trim() };
      const response = await OrderService.requestTrackingAccess(request);
      
      if (response.success) {
        setAccessRequested(true);
        toast.success(response.message);
        
        // Set token expiry from response
        if (response.expiresAt) {
          setTokenExpiry(new Date(response.expiresAt));
        }
      } else {
        setError(response.message);
        toast.error(response.message);
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to send access link");
      toast.error(err.message || "Failed to send access link");
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const handleTokenVerification = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) {
      toast.error("Please enter the access token");
      return;
    }

    setIsVerifyingToken(true);
    setError(null);
    setOrderDetails(null);

    try {
      // Load orders list using the token
      const ordersResponse = await OrderService.getOrdersByToken(tokenToVerify.trim(), 0, 20);
      
      if (ordersResponse.success && ordersResponse.data.length > 0) {
        setOrdersList(ordersResponse.data);
        setShowOrdersList(true);
        toast.success(`Found ${ordersResponse.data.length} order(s) for your email!`);
      } else {
        setError("No orders found for this token");
        toast.error("No orders found for this token");
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired access token");
      toast.error(err.message || "Invalid or expired access token");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTokenVerification(token);
  };

  const handleOrderClick = async (orderId: number) => {
    if (!token) {
      toast.error("No valid token available");
      return;
    }

    setIsVerifyingToken(true);
    setError(null);

    try {
      const orderDetails = await OrderService.getOrderByTokenAndId(token, orderId);
      setOrderDetails(orderDetails);
      setShowOrdersList(false);

      // Check for return request
      if (orderDetails.orderNumber) {
        await checkForReturnRequest(orderDetails.orderNumber);
      }

      toast.success("Order details loaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
      toast.error(err.message || "Failed to load order details");
    } finally {
      setIsVerifyingToken(false);
    }
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
    if (!item.isReturnEligible) {
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

  const hasEligibleItems = orderDetails?.items?.some(item => item.isReturnEligible) || false;
  const isDelivered = orderDetails?.status?.toLowerCase() === 'delivered';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Secure Order Tracking</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For your security, we'll send a secure access link to the email address you used when placing your order. 
            This ensures only you can view your order details.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Orders List Display */}
        {showOrdersList && ordersList.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Orders ({ordersList.length})
                </CardTitle>
                <CardDescription>
                  Click on any order to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ordersList.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">Order #{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            {order.hasReturnRequest && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                Return Active
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {formatCurrency(order.total)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {order.customerName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <span className="text-sm mr-2">View Details</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOrdersList(false);
                    setOrdersList([]);
                    setAccessRequested(false);
                    setToken("");
                    setEmail("");
                    setError(null);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Track Different Email
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : orderDetails ? (
          /* Order Details Display */
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{orderDetails.orderNumber}
                    </CardTitle>
                    <CardDescription>
                      Placed on{" "}
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(orderDetails.status)}>
                    {orderDetails.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Order Date:</strong>{" "}
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Total:</strong>{" "}
                      {formatCurrency(orderDetails.total || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Status:</strong> {orderDetails.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-6">
                {orderDetails.items && orderDetails.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orderDetails.items.map((item, index) => {
                          const displayProduct = item.variant || item.product;
                          
                          return (
                            <div
                              key={index}
                              className="flex items-start gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {displayProduct?.images &&
                                displayProduct.images.length > 0 ? (
                                  <img
                                    src={displayProduct.images[0]}
                                    alt={displayProduct.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">
                                      {displayProduct?.name || "Product"}
                                    </h4>
                                    {item.variant && (
                                      <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      Quantity: {item.quantity} • Price: {formatCurrency(item.price || 0)}
                                    </p>
                                    <p className="text-sm font-medium">
                                      Total: {formatCurrency(item.totalPrice)}
                                    </p>
                                  </div>
                                </div>

                                {/* Return Eligibility Information */}
                                {isDelivered && item.maxReturnDays && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Clock className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium">Return Information</span>
                                      {getDaysRemainingBadge(item)}
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p>Return window: {item.maxReturnDays} days from delivery</p>
                                      {item.isReturnEligible ? (
                                        <p className="text-green-600 font-medium">✓ Eligible for return</p>
                                      ) : (
                                        <p className="text-red-600 font-medium">✗ Return window expired</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Information Sidebar */}
              <div className="space-y-6">
                {/* Customer Information */}
                {orderDetails.customerInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{orderDetails.customerInfo.firstName} {orderDetails.customerInfo.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{orderDetails.customerInfo.email}</span>
                      </div>
                      {orderDetails.customerInfo.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{orderDetails.customerInfo.phoneNumber}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Address */}
                {orderDetails.shippingAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <p>{orderDetails.shippingAddress.street}</p>
                        <p>
                          {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
                        </p>
                        <p>{orderDetails.shippingAddress.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Information */}
                {(orderDetails.paymentMethod || orderDetails.paymentStatus) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {orderDetails.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{orderDetails.paymentMethod}</span>
                        </div>
                      )}
                      {orderDetails.paymentStatus && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Status: {orderDetails.paymentStatus}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Return Information Section */}
            {hasReturnRequest && (
              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    Return Request Active
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    You have an active return request for this order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" asChild>
                      <Link
                        href={`/returns/info?orderNumber=${orderDetails.orderNumber}`}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Return Information
                      </Link>
                    </Button>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" asChild>
                      <Link href="/returns">
                        Manage Returns
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100/50 p-2 rounded mt-3">
                    <AlertCircle className="h-3 w-3" />
                    <span>Click "View Return Information" to see complete details and current status</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Options */}
            <div className="flex justify-center gap-4 pt-6">
              {ordersList.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOrderDetails(null);
                    setShowOrdersList(true);
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Back to Orders List
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setOrderDetails(null);
                  setOrdersList([]);
                  setShowOrdersList(false);
                  setAccessRequested(false);
                  setToken("");
                  setEmail("");
                  setError(null);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Track Different Email
              </Button>
            </div>
          </div>
        ) : !accessRequested && !token ? (
          /* Email Request Form */
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Enter Your Email</CardTitle>
                <CardDescription className="text-gray-600">
                  We'll send a secure access link to the email address you used when placing your order
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isRequestingAccess}
                      className="h-12 text-center text-lg border-2 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    disabled={isRequestingAccess}
                  >
                    {isRequestingAccess ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Access Link...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Access Link
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-center pt-4 border-t">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    🔒 Your email is secure and will only be used for order verification
                  </p>
                  <p className="text-xs text-gray-500">
                    Having trouble? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : accessRequested && !orderDetails ? (
          /* Access Requested - Show Token Input */
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-800">Check Your Email</CardTitle>
                <CardDescription className="text-green-700">
                  We've sent a secure access link to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <Timer className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      The access link will expire in 15 minutes for security
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Click the link in your email, or enter the access token below:
                    </p>
                    
                    <form onSubmit={handleTokenSubmit} className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Enter access token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        disabled={isVerifyingToken}
                        className="h-12 text-center font-mono text-sm border-2 focus:border-green-500 transition-colors"
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        disabled={isVerifyingToken || !token.trim()}
                      >
                        {isVerifyingToken ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4" />
                            Access My Orders
                          </div>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-center pt-4 border-t">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button 
                      onClick={() => {
                        setAccessRequested(false);
                        setToken("");
                      }}
                      className="text-green-600 hover:underline font-medium"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : null}

        {/* How Secure Tracking Works */}
        {!orderDetails && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4 text-center">How Secure Tracking Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 border text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">1. Enter Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the email address you used when placing your order. We'll verify it matches our records.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">2. Secure Link Sent</h3>
                <p className="text-sm text-muted-foreground">
                  We'll send a secure, time-limited access link to your email. This ensures only you can view your orders.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">3. View Order Details</h3>
                <p className="text-sm text-muted-foreground">
                  Access your complete order information, tracking status, and return options securely.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
