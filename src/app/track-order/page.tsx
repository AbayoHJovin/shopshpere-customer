"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Search, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be implemented later
    alert(`Track order functionality will be implemented soon for order: ${orderNumber}`);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsUploading(false);
      alert("QR code scanning will be implemented soon");
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">Track Your Order</h1>
          <p className="text-muted-foreground">
            Check the status of your order using your order number or QR code
          </p>
        </div>
        
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
                  You can find your order number in the confirmation email we sent you
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
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Track Order
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Don't have your order number?{" "}
                  <Link href="/contact" className="text-primary hover:underline">
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
                  Upload the QR code image you received after placing your order
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
                      <label>
                        <Button variant="outline" className="relative" disabled={isUploading}>
                          {isUploading ? "Processing..." : "Select File"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Can't find your QR code?{" "}
                  <Link href="/track-order" className="text-primary hover:underline">
                    Track by order number
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">How Tracking Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Enter Your Details</h3>
              <p className="text-sm text-muted-foreground">
                Use your order number or scan the QR code provided when you completed your purchase.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">View Status</h3>
              <p className="text-sm text-muted-foreground">
                See real-time updates on processing, packaging, and shipping stages of your order.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Get Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email updates when your order status changes until it's delivered.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              Return to Home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 