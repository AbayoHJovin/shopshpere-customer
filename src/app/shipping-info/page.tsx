"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Calculator,
  MapPin,
  Clock,
  Package,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Info,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function ShippingInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/account">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Account
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            Shipping & Calculation Info
          </h1>
          <p className="text-muted-foreground mt-2">
            Understand how shipping costs are calculated and our delivery
            options
          </p>
        </div>

        {/* Shipping Cost Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Shipping Cost Calculation
            </CardTitle>
            <CardDescription>
              How we calculate shipping costs for your orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Standard Shipping Rates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm">Orders under $25</span>
                    <Badge variant="secondary">$4.99</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm">Orders $25 - $50</span>
                    <Badge variant="secondary">$2.99</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md bg-green-50">
                    <span className="text-sm">Orders over $50</span>
                    <Badge variant="default" className="bg-green-500">
                      FREE
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Express Shipping Rates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm">Next Day Delivery</span>
                    <Badge variant="secondary">$9.99</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm">2-Day Delivery</span>
                    <Badge variant="secondary">$6.99</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-sm">Same Day Delivery</span>
                    <Badge variant="destructive">$19.99</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Algorithm */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Calculation Algorithm
            </CardTitle>
            <CardDescription>
              Step-by-step breakdown of how shipping costs are determined
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-md">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Order Value Check</h4>
                  <p className="text-sm text-muted-foreground">
                    System calculates the total value of items in your cart
                    (excluding taxes and discounts)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-md">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Shipping Method Selection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your selected delivery speed (Standard, Express,
                    Same Day)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-md">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Location-Based Adjustment
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Additional fees may apply for remote locations or special
                    handling requirements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-md">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Final Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    System applies any applicable discounts, promotions, or
                    membership benefits
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Standard Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">3-5 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Nationwide coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Package tracking included</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Express Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">1-2 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Major cities only</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Priority handling</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-red-500" />
                Same Day Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Same day (if ordered before 2 PM)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Limited areas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Real-time tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Fees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-orange-500" />
              Additional Fees & Considerations
            </CardTitle>
            <CardDescription>
              Additional charges that may apply to your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Special Handling Fees</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Oversized items</span>
                    <span className="text-sm font-medium">+$5.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fragile items</span>
                    <span className="text-sm font-medium">+$3.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Signature required</span>
                    <span className="text-sm font-medium">+$2.00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Location-Based Fees</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Remote areas</span>
                    <span className="text-sm font-medium">+$7.99</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">PO Box delivery</span>
                    <span className="text-sm font-medium">+$2.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">International</span>
                    <span className="text-sm font-medium">
                      Calculated separately
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Calculation Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Total Calculation Example
            </CardTitle>
            <CardDescription>
              Example breakdown of how your total is calculated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-md">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Subtotal (Items)</span>
                  <span className="text-sm font-medium">$45.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discount Applied</span>
                  <span className="text-sm font-medium text-green-600">
                    -$5.00
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Shipping (Standard)</span>
                  <span className="text-sm font-medium">$2.99</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tax (8.5%)</span>
                  <span className="text-sm font-medium">$3.40</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">$46.39</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-blue-800">
                Add items worth $5 more to your cart to qualify for free
                shipping and save $2.99!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
