"use client";

import { FC } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";

const AccountQuickActions: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Orders
          </CardTitle>
          <CardDescription>View your order history and track current orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link href="/account/orders">
              <Button variant="outline" className="w-full justify-start">View All Orders</Button>
            </Link>
            <Link href="/track-order">
              <Button variant="outline" className="w-full justify-start">Track Order</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Wishlist
          </CardTitle>
          <CardDescription>Manage your saved items and wishlists</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/wishlist">
            <Button variant="outline" className="w-full justify-start">View Wishlist</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountQuickActions;
