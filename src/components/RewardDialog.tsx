"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, ArrowRight } from "lucide-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearSignupResponse } from "@/lib/store/slices/authSlice";

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  awardedPoints: number;
  pointsDescription?: string;
}

export default function RewardDialog({
  isOpen,
  onClose,
  awardedPoints,
  pointsDescription,
}: RewardDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLearnMore = () => {
    dispatch(clearSignupResponse());
    router.push("/reward-system");
  };

  const handleClose = () => {
    dispatch(clearSignupResponse());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welcome Bonus!
          </DialogTitle>
          <DialogDescription className="text-lg">
            You've earned <strong>{awardedPoints} points</strong> for signing
            up!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold text-yellow-600">
                {awardedPoints} Points
              </span>
            </div>
            {pointsDescription && (
              <p className="text-sm text-gray-600">{pointsDescription}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                ✓ Earned
              </Badge>
              <span>Signup bonus points added to your account</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                💰 Redeemable
              </Badge>
              <span>Use points for discounts on future purchases</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleLearnMore}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
