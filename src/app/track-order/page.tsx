"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  Upload,
  ArrowRight,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import QRCode from "qrcode";
import QrScanner from "qr-scanner";
import { OrderService, OrderDetailsResponse } from "@/lib/orderService";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter an order number");
      return;
    }

    setIsTracking(true);
    setError(null);
    setOrderDetails(null);

    try {
      const order = await OrderService.trackOrderByNumber(orderNumber.trim());
      setOrderDetails(order);

      // Generate QR code for pickup token if available
      if (order.pickupToken) {
        const qrDataUrl = await QRCode.toDataURL(order.pickupToken, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      }

      toast.success("Order found successfully!");
    } catch (err: any) {
      setError(err.message || "Order not found");
      toast.error(err.message || "Order not found");
    } finally {
      setIsTracking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setOrderDetails(null);

    try {
      const result = await QrScanner.scanImage(file);
      if (result) {
        // Try to track order by pickup token
        setIsTracking(true);
        const order = await OrderService.trackOrderByToken(result);
        setOrderDetails(order);

        // Generate QR code for pickup token
        if (order.pickupToken) {
          const qrDataUrl = await QRCode.toDataURL(order.pickupToken, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQrCodeDataUrl(qrDataUrl);
        }

        toast.success("Order found from QR code!");
      } else {
        setError("No QR code found in the image");
        toast.error("No QR code found in the image");
      }
    } catch (err: any) {
      setError(err.message || "Failed to scan QR code");
      toast.error(err.message || "Failed to scan QR code");
    } finally {
      setIsUploading(false);
      setIsTracking(false);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
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
          <h1 className="text-3xl font-bold mb-3">Track Your Order</h1>
          <p className="text-muted-foreground">
            Check the status of your order using your order number or QR code
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Details Display */}
        {orderDetails ? (
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
                        {orderDetails.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 border rounded-lg"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.product?.images &&
                              item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.variant?.images &&
                                item.variant.images.length > 0 ? (
                                <img
                                  src={item.variant.images[0]}
                                  alt={item.variant.name}
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
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-medium">
                                {formatCurrency(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Address */}
                {orderDetails.shippingAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {orderDetails.shippingAddress.fullName}
                        </p>
                        <p>{orderDetails.shippingAddress.addressLine1}</p>
                        {orderDetails.shippingAddress.addressLine2 && (
                          <p>{orderDetails.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {orderDetails.shippingAddress.city},{" "}
                          {orderDetails.shippingAddress.state}{" "}
                        </p>
                        <p>{orderDetails.shippingAddress.country}</p>
                        {orderDetails.shippingAddress.phone && (
                          <p className="flex items-center gap-2 mt-2">
                            <Phone className="h-4 w-4" />
                            {orderDetails.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pickup Token QR Code */}
                {orderDetails.pickupToken && qrCodeDataUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Pickup Token QR Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Show this QR code when picking up your order.
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
                          Download QR Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Order Placed</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(orderDetails.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            orderDetails.status === "confirmed" ||
                            orderDetails.status === "processing" ||
                            orderDetails.status === "shipped" ||
                            orderDetails.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">Confirmed</p>
                          <p className="text-xs text-muted-foreground">
                            Order confirmed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            orderDetails.status === "processing" ||
                            orderDetails.status === "shipped" ||
                            orderDetails.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">Processing</p>
                          <p className="text-xs text-muted-foreground">
                            Preparing your order
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            orderDetails.status === "shipped" ||
                            orderDetails.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">Shipped</p>
                          <p className="text-xs text-muted-foreground">
                            On its way to you
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            orderDetails.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">Delivered</p>
                          <p className="text-xs text-muted-foreground">
                            Order delivered
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                {(orderDetails.paymentMethod || orderDetails.paymentStatus) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {orderDetails.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Method:
                            </span>
                            <span className="text-sm font-medium">
                              {orderDetails.paymentMethod}
                            </span>
                          </div>
                        )}
                        {orderDetails.paymentStatus && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Status:
                            </span>
                            <Badge variant="outline">
                              {orderDetails.paymentStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  Return to Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                onClick={() => {
                  setOrderDetails(null);
                  setError(null);
                  setQrCodeDataUrl(null);
                  setOrderNumber("");
                }}
              >
                Track Another Order
              </Button>
            </div>
          </div>
        ) : (
          /* Tracking Form */
          <Tabs defaultValue="number" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="number" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Track by Order Number</span>
              </TabsTrigger>
              <TabsTrigger value="qrcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>Scan QR Code</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="number">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Your Order Number</CardTitle>
                  <CardDescription>
                    You can find your order number in the confirmation email we
                    sent you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Order number (e.g., ORD-12345678)"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="w-full"
                        disabled={isTracking}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isTracking}
                    >
                      {isTracking ? "Tracking..." : "Track Order"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    Don't have your order number?{" "}
                    <Link
                      href="/contact"
                      className="text-primary hover:underline"
                    >
                      Contact support
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="qrcode">
              <Card>
                <CardHeader>
                  <CardTitle>Scan Your Order QR Code</CardTitle>
                  <CardDescription>
                    Upload the QR code image you received after placing your
                    order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-muted/30">
                    <div className="text-center space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-xl font-medium">Upload QR Code</p>
                        <p className="text-sm text-muted-foreground pb-4">
                          Drag and drop or click to upload
                        </p>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileUpload}
                            disabled={isUploading || isTracking}
                            id="qr-file-input"
                          />
                          <Button
                            variant="outline"
                            className="relative"
                            disabled={isUploading || isTracking}
                            onClick={() => {
                              const fileInput = document.getElementById(
                                "qr-file-input"
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.click();
                              }
                            }}
                          >
                            {isUploading
                              ? "Processing..."
                              : isTracking
                              ? "Tracking..."
                              : "Select File"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    Can't find your QR code?{" "}
                    <Link
                      href="/track-order"
                      className="text-primary hover:underline"
                    >
                      Track by order number
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* How Tracking Works */}
        {!orderDetails && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">How Tracking Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 border">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Enter Your Details</h3>
                <p className="text-sm text-muted-foreground">
                  Use your order number or scan the QR code provided when you
                  completed your purchase.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">View Status</h3>
                <p className="text-sm text-muted-foreground">
                  See real-time updates on processing, packaging, and shipping
                  stages of your order.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Get Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email updates when your order status changes until
                  it's delivered.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
