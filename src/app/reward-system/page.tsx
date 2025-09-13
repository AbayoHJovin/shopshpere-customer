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
  Gift,
  Star,
  Trophy,
  ShoppingBag,
  Percent,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function RewardSystemPage() {
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
            <Gift className="h-8 w-8 text-primary" />
            Reward System
          </h1>
          <p className="text-muted-foreground mt-2">
            Learn how our reward system works and start earning points with
            every purchase
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Earn Points</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-primary">1%</p>
              <p className="text-sm text-muted-foreground">of every purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Redeem Rewards</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-primary">100 pts</p>
              <p className="text-sm text-muted-foreground">= $1 discount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Bonus Points</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-primary">2x</p>
              <p className="text-sm text-muted-foreground">on special events</p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              How It Works
            </CardTitle>
            <CardDescription>
              Simple steps to start earning and redeeming rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Shop</h3>
                <p className="text-sm text-muted-foreground">
                  Make purchases on our platform
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Earn</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically earn 1 point per $1 spent
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Redeem</h3>
                <p className="text-sm text-muted-foreground">
                  Use points for discounts on future purchases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reward Tiers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Reward Tiers
            </CardTitle>
            <CardDescription>
              Unlock exclusive benefits as you earn more points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Bronze Member</h3>
                    <p className="text-sm text-muted-foreground">
                      0 - 999 points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Standard</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Silver Member</h3>
                    <p className="text-sm text-muted-foreground">
                      1,000 - 4,999 points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default">Premium</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Gold Member</h3>
                    <p className="text-sm text-muted-foreground">
                      5,000+ points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="bg-yellow-500">
                    VIP
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-green-500" />
                Silver Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">5% bonus points on purchases</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Free shipping on orders over $25
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Early access to sales</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Gold Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">10% bonus points on purchases</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Free shipping on all orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Exclusive products access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Personal shopping assistant</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Points Expiration
                </h4>
                <p>
                  Points expire after 12 months of inactivity. Active members
                  keep their points indefinitely.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Minimum Redemption
                </h4>
                <p>Minimum redemption amount is 100 points ($1 discount).</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Bonus Events
                </h4>
                <p>
                  Double points events are announced in advance and apply to
                  eligible purchases only.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Tier Benefits
                </h4>
                <p>
                  Tier benefits are calculated based on points earned in the
                  last 12 months.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
