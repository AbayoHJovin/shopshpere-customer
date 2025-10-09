"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Search,
  ShoppingBag,
  ArrowLeft,
  Package,
  AlertTriangle,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Package className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              The page you're looking for seems to have wandered off.
            </p>
            <p className="text-base text-gray-500">
              Don't worry, even the best explorers sometimes take a wrong turn!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>

            <Link href="/shop">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        {/* Help Text */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <AlertTriangle className="h-4 w-4" />
            <span>
              If you believe this is an error, please{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                contact our support team
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
