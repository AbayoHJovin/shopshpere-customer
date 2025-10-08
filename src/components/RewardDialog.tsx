"use client";

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
    router.push("/reward-system");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-blue-50 to-white border border-blue-100 shadow-xl rounded-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-blue-700">
            🎉 Welcome Bonus!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-1">
            You’ve just earned{" "}
            <strong className="text-blue-700 font-semibold">
              {awardedPoints} points
            </strong>{" "}
            for joining us!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-center border border-blue-100 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-blue-500 fill-current" />
              <span className="text-3xl font-extrabold text-blue-600">
                {awardedPoints} Points
              </span>
            </div>
            {pointsDescription && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {pointsDescription}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border border-green-200"
              >
                ✓ Earned
              </Badge>
              <span>Signup bonus successfully added to your account</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border border-blue-200"
              >
                Redeemable
              </Badge>
              <span>Use these points for discounts on future purchases</span>
            </div>
          </div>

          <div className="flex gap-3 pt-5">
            <Button
              onClick={handleLearnMore}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
