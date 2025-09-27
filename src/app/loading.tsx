"use client";

import React from "react";
import { Loader2, ShoppingBag } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="animate-pulse">
            <div className="bg-blue-600 rounded-full p-6 mx-auto w-fit shadow-lg">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
          </div>
          
          {/* Spinning Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Loading ShopSphere
          </h2>
          <p className="text-gray-600">
            Preparing your shopping experience...
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
