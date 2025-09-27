"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  RefreshCw, 
  AlertTriangle,
  Bug,
  ArrowLeft
} from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          {/* Error Illustration */}
          <div className="relative mb-8">
            <div className="bg-white rounded-full p-6 shadow-lg mx-auto w-fit">
              <Bug className="h-16 w-16 text-red-500" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Something went wrong!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              We encountered an unexpected error while processing your request.
            </p>
            <p className="text-base text-gray-500">
              Our team has been notified and is working to fix this issue.
            </p>
          </div>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mb-8 text-left">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Error Details (Development)</span>
                </div>
                <pre className="text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={reset}
              size="lg" 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
            
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              What can you do?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <RefreshCw className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Try refreshing the page</p>
                  <p className="text-xs text-gray-600">Sometimes a simple refresh can resolve temporary issues</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <Home className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Go back to homepage</p>
                  <p className="text-xs text-gray-600">Start fresh from our main page</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Contact support</p>
                  <p className="text-xs text-gray-600">
                    If the problem persists, please{" "}
                    <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                      contact our support team
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Error occurred at {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
