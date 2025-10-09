"use client";

import React, { useState } from "react";
import { Coins, CreditCard, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/priceFormatter";
import { toast } from "sonner";
import {
  pointsPaymentService,
  PointsPaymentPreview,
  PointsPaymentRequest,
} from "@/lib/services/points-payment-service";
import { formatStockErrorMessage, extractErrorDetails } from "@/lib/utils/errorParser";

interface PointsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: number, orderNumber?: string, pointsUsed?: number, pointsValue?: number) => void;
  onHybridPayment: (stripeSessionId: string, orderId: number) => void;
  paymentRequest: PointsPaymentRequest;
}

export function PointsPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  onHybridPayment,
  paymentRequest,
}: PointsPaymentModalProps) {
  const [preview, setPreview] = useState<PointsPaymentPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadPreview = async () => {
    if (!isOpen || preview) return;
    
    setLoading(true);
    try {
      const previewData = await pointsPaymentService.previewPointsPayment(paymentRequest);
      setPreview(previewData);
    } catch (error: any) {
      console.error("Error loading points preview:", error);
      
      const errorDetails = extractErrorDetails(error);
      
      // Check for country validation errors first
      if (errorDetails.errorCode === "VALIDATION_ERROR" && 
          (errorDetails.message?.includes("don't deliver to") || errorDetails.details?.includes("don't deliver to"))) {
        const countryMessage = errorDetails.message || errorDetails.details || "We don't deliver to this country.";
        toast.error(countryMessage, {
          duration: 10000, // Longer duration for important country validation messages
          style: {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b',
          },
        });
      }
      // Check if this is a stock-related error
      else if (errorDetails.details && (errorDetails.details.includes("not available") || errorDetails.details.includes("out of stock"))) {
        const stockMessage = formatStockErrorMessage(errorDetails.details);
        toast.error(stockMessage, {
          duration: 8000,
        });
      } else if (errorDetails.message && (errorDetails.message.includes("not available") || errorDetails.message.includes("out of stock"))) {
        const stockMessage = formatStockErrorMessage(errorDetails.message);
        toast.error(stockMessage, {
          duration: 8000,
        });
      } else {
        toast.error(errorDetails.message || "Failed to load points information");
      }
      
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!preview) return;

    setProcessing(true);
    try {
      const result = await pointsPaymentService.processPointsPayment(paymentRequest);
      
      if (result.success) {
        if (result.hybridPayment && result.stripeSessionId && result.orderId) {
          onHybridPayment(result.stripeSessionId, result.orderId);
        } else if (result.orderId) {
          toast.success("Payment completed successfully!");
          // Pass orderNumber and points information to the success callback
          onSuccess(result.orderId, result.orderNumber, result.pointsUsed, result.pointsValue);
        }
      } else {
        toast.error(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Error processing points payment:", error);
      
      const errorDetails = extractErrorDetails(error);
      
      // Check for country validation errors first
      if (errorDetails.errorCode === "VALIDATION_ERROR" && 
          (errorDetails.message?.includes("don't deliver to") || errorDetails.details?.includes("don't deliver to"))) {
        const countryMessage = errorDetails.message || errorDetails.details || "We don't deliver to this country.";
        toast.error(countryMessage, {
          duration: 10000, // Longer duration for important country validation messages
          style: {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b',
          },
        });
      }
      // Check if this is a stock-related error
      else if (errorDetails.details && (errorDetails.details.includes("not available") || errorDetails.details.includes("out of stock"))) {
        const stockMessage = formatStockErrorMessage(errorDetails.details);
        toast.error(stockMessage, {
          duration: 8000,
        });
      } else if (errorDetails.message && (errorDetails.message.includes("not available") || errorDetails.message.includes("out of stock"))) {
        const stockMessage = formatStockErrorMessage(errorDetails.message);
        toast.error(stockMessage, {
          duration: 8000,
        });
      } else {
        toast.error(errorDetails.message || "Payment processing failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      loadPreview();
    } else {
      setPreview(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            Pay with Points
          </DialogTitle>
          <DialogDescription>
            Use your reward points to pay for this order
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading points information...</span>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Available Points</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {preview.availablePoints.toLocaleString()} points
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Point Value: {formatPrice(preview.pointValue)} per point
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Order Total</span>
                <span className="font-medium">{formatPrice(preview.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Points Value</span>
                <span className="font-medium text-green-600">
                  -{formatPrice(preview.pointsValue)}
                </span>
              </div>

              {preview.remainingToPay > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Remaining to Pay</span>
                  <span className="font-medium text-orange-600">
                    {formatPrice(preview.remainingToPay)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Final Amount</span>
                <span className={preview.canPayWithPointsOnly ? "text-green-600" : ""}>
                  {preview.canPayWithPointsOnly ? "FREE" : formatPrice(preview.remainingToPay)}
                </span>
              </div>
            </div>

            {!preview.canPayWithPointsOnly && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CreditCard className="h-4 w-4" />
                  <span>
                    You'll be redirected to complete payment for the remaining {formatPrice(preview.remainingToPay)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPayment} 
            disabled={!preview || processing}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : preview?.canPayWithPointsOnly ? (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Pay with Points
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Use Points & Pay {formatPrice(preview?.remainingToPay || 0)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
