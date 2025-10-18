"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Clock, Users, Package, Percent } from "lucide-react";
import { discountService, DiscountInfo } from "@/lib/discountService";
import CountdownTimer from "@/components/CountdownTimer";

const ActiveDiscounts = () => {
  const [discounts, setDiscounts] = useState<DiscountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const activeDiscounts = await discountService.getActiveDiscounts();
        setDiscounts(activeDiscounts);
      } catch (err) {
        console.error("Error fetching active discounts:", err);
        setError("Failed to load active discounts");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Active discounts
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Active discounts
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Active discounts
        </h2>
        <Link href="/discounts">
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-800 p-0 h-auto"
          >
            See more
          </Button>
        </Link>
      </div>

      {discounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No active discounts at the moment</p>
          <p className="text-xs text-gray-400 mt-1">
            Check back later for great deals!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {discounts.slice(0, 3).map((discount) => (
            <Link
              key={discount.discountId}
              href={`/discounts/${discount.discountId}`}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5 text-red-500" />
                        {discount.name}
                        <Badge variant="destructive" className="ml-2">
                          {discount.percentage}% OFF
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {discount.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Countdown Timer - Dedicated Space */}
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="h-5 w-5 text-red-500" />
                      <div className="text-center">
                        <p className="text-red-600 text-sm font-medium mb-1">Ends in</p>
                        <CountdownTimer
                          endDate={discount.endDate}
                          onExpired={() => {
                            console.log(`Discount ${discount.name} expired`);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other Info - Grid Layout */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Usage</p>
                        <p className="font-medium">
                          {discount.usedCount}/{discount.usageLimit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Products</p>
                        <p className="font-medium">{discount.productCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Code</p>
                        <p className="font-medium font-mono text-blue-600">
                          {discount.discountCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveDiscounts;
