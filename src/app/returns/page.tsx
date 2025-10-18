'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  QrCode, 
  User, 
  UserX, 
  ArrowRight, 
  Info,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReturnsPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [pickupToken, setPickupToken] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('authToken');

  const handleAuthenticatedReturn = () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }

    setLoading(true);
    // Navigate to return request page with order number
    router.push(`/returns/request?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
  };

  const handleGuestReturn = () => {
    if (!orderNumber.trim() || !pickupToken.trim()) {
      toast.error('Please enter both order number and pickup token');
      return;
    }

    setLoading(true);
    // Navigate to return request page with order number and pickup token
    router.push(
      `/returns/request?orderNumber=${encodeURIComponent(orderNumber.trim())}&pickupToken=${encodeURIComponent(pickupToken.trim())}`
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Return Your Order
        </h1>
        <p className="text-gray-600">
          Start a return request for items from your recent orders
        </p>
      </div>

      {/* Return Policy Info */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Return Policy:</strong> Items can be returned within 15 days of delivery. 
          Items must be in original condition with tags attached.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={isAuthenticated ? "authenticated" : "guest"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="authenticated" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Registered Customer
          </TabsTrigger>
          <TabsTrigger value="guest" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Guest Order
          </TabsTrigger>
        </TabsList>

        {/* Authenticated User Tab */}
        <TabsContent value="authenticated">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Return as Registered Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You need to be logged in to use this option. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1"
                      onClick={() => router.push('/auth/login')}
                    >
                      Sign in here
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="auth-order-number">Order Number *</Label>
                <Input
                  id="auth-order-number"
                  type="text"
                  placeholder="Enter your order number (e.g., ORD-123456)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="mt-1"
                  disabled={!isAuthenticated}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can find your order number in your order confirmation email or account dashboard.
                </p>
              </div>

              <Button
                onClick={handleAuthenticatedReturn}
                disabled={loading || !isAuthenticated || !orderNumber.trim()}
                className="w-full flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {isAuthenticated && (
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Signed In</span>
                  </div>
                  <p className="text-sm text-green-600">
                    We'll automatically load your order details and customer information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guest User Tab */}
        <TabsContent value="guest">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Return Guest Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="guest-order-number">Order Number *</Label>
                <Input
                  id="guest-order-number"
                  type="text"
                  placeholder="Enter your order number (e.g., ORD-123456)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pickup-token">Pickup Token *</Label>
                <Input
                  id="pickup-token"
                  type="text"
                  placeholder="Enter your pickup token"
                  value={pickupToken}
                  onChange={(e) => setPickupToken(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your pickup token was provided in your order confirmation email or QR code.
                </p>
              </div>

              <Button
                onClick={handleGuestReturn}
                disabled={loading || !orderNumber.trim() || !pickupToken.trim()}
                className="w-full flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <QrCode className="h-4 w-4" />
                  <span className="font-medium">Need Help Finding Your Pickup Token?</span>
                </div>
                <p className="text-sm text-blue-600">
                  Check your order confirmation email or look for the QR code that was sent to you after placing the order.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Return Process Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            How Returns Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Select Items</p>
                <p className="text-sm text-gray-600">
                  Choose which items you want to return and specify quantities and reasons.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Submit Request</p>
                <p className="text-sm text-gray-600">
                  Provide return reasons and optionally attach photos or videos.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Get Approval</p>
                <p className="text-sm text-gray-600">
                  We'll review your request within 1-2 business days and send you instructions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">4</span>
              </div>
              <div>
                <p className="font-medium">Return Items</p>
                <p className="text-sm text-gray-600">
                  Follow the provided instructions to return your items and receive your refund.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Help */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Need help? Contact our{' '}
          <Button variant="link" className="p-0 h-auto">
            customer support team
          </Button>
        </p>
      </div>
    </div>
  );
}
