"use client";

import { FC } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Truck } from "lucide-react";

interface AccountActionsCardProps {
  onLogout: () => void;
}

const AccountActionsCard: FC<AccountActionsCardProps> = ({ onLogout }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Account Actions
        </CardTitle>
        <CardDescription>Manage your account and privacy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/shipping-info">
            <Button variant="outline" className="w-full justify-start">
              <Truck className="mr-2 h-4 w-4" /> Shipping Info
            </Button>
          </Link>
          <Button variant="destructive" className="w-full justify-start" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountActionsCard;
