"use client";

import { FC } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User, Gift } from "lucide-react";

export interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  userEmail: string;
  phoneNumber?: string;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  enabled: boolean;
  points?: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountProfileCardProps {
  userData: UserData;
  getUserInitials: () => string;
  formatDate: (d: string) => string;
}

const AccountProfileCard: FC<AccountProfileCardProps> = ({ userData, getUserInitials, formatDate }) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {(userData?.firstName || "User") + " " + (userData?.lastName || "")}
        </CardTitle>
        <CardDescription>{userData?.userEmail}</CardDescription>
        <Badge variant={userData?.enabled ? "default" : "secondary"} className="mt-2">
          {userData?.enabled ? "Active" : "Inactive"}
        </Badge>
        {typeof userData?.points === "number" && (
          <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-md border">
            <div className="flex items-center justify-center gap-2">
              <Gift className="h-5 w-5 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-700">{userData.points || 0} Points</span>
            </div>
            <p className="text-xs text-center text-gray-600 mt-1">
              {userData.points && userData.points > 0 ? "Available for redemption" : "Start earning points today!"}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{userData?.userEmail}</span>
        </div>
        {userData?.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{userData.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">{userData?.role?.toLowerCase() || "Customer"}</span>
        </div>
        <div className="pt-4 border-t mt-2">
          <p className="text-xs text-muted-foreground">
            Member since {userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}
          </p>
          {userData?.lastLogin && (
            <p className="text-xs text-muted-foreground mt-1">
              Last login: {formatDate(userData.lastLogin)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountProfileCard;
