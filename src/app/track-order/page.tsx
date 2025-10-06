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
import { OrderService, OrderTrackingRequest, OrderSummary } from "@/lib/orderService";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [ordersList, setOrdersList] = useState<OrderSummary[]>([]);
  const [showOrdersList, setShowOrdersList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessRequested, setAccessRequested] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);

  // Check if token is provided in URL on component mount
  useEffect(() => {
    if (tokenFromUrl) {
      handleTokenVerification(tokenFromUrl);
    }
  }, [tokenFromUrl]);


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
        setError(null); // Clear any previous errors
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

  const handleOrderClick = (orderId: number) => {
    if (!token) {
      toast.error("No valid token available");
      return;
    }

    // Navigate to the individual order page with token and order ID
    const url = `/track-order/${orderId}?token=${encodeURIComponent(token)}`;
    window.location.href = url;
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

        {/* Error Alert with Token Refresh Option */}
        {error && !showOrdersList && (
          <div className="mb-6">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            {/* Show email input when token is expired/invalid */}
            <Card className="max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <RotateCcw className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-800">Token Expired or Invalid</CardTitle>
                <CardDescription className="text-red-700">
                  Please enter your email to receive a new secure access link
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
                      className="h-12 text-center text-lg border-2 focus:border-red-500 transition-colors"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    disabled={isRequestingAccess}
                  >
                    {isRequestingAccess ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending New Access Link...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send New Access Link
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
                  <button 
                    onClick={() => {
                      setError(null);
                      setAccessRequested(false);
                      setToken("");
                      setEmail("");
                      setShowOrdersList(false);
                      setOrdersList([]);
                    }}
                    className="text-sm text-red-600 hover:underline font-medium"
                  >
                    Start Over
                  </button>
                </div>
              </CardFooter>
            </Card>
          </div>
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
        ) : accessRequested ? (
          /* Access Requested - Email Sent Confirmation */
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-800">Email Sent Successfully!</CardTitle>
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
                  
                  <div className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Check your email inbox
                      </p>
                      <p className="text-xs text-green-700">
                        Click the secure link in your email to view your orders
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>📧 The email should arrive within a few minutes</p>
                      <p>🔒 The link is secure and expires automatically</p>
                      <p>📱 Works on all devices - desktop, tablet, and mobile</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-center pt-4 border-t">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAccessRequested(false);
                        setToken("");
                        setError(null);
                      }}
                      className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Send Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAccessRequested(false);
                        setToken("");
                        setEmail("");
                        setError(null);
                      }}
                      className="flex-1"
                    >
                      Use Different Email
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : null}

        {/* How Secure Tracking Works */}
        {!showOrdersList && (
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
