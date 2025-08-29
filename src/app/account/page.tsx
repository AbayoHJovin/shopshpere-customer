"use client";

import { useAppSelector } from "@/lib/store/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Settings,
  ShoppingBag,
  Heart,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AccountPage() {
  const { user } = useAppSelector((state) => state.auth);

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">
                    {user?.firstName} {user?.lastName}
                  </CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                  <Badge
                    variant={user?.isActive ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {user?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                    {user?.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}
                    {user?.dateOfBirth && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(user.dateOfBirth)}</span>
                      </div>
                    )}
                    {user?.gender && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">
                          {user.gender.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Member since{" "}
                      {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Actions */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Orders
                    </CardTitle>
                    <CardDescription>
                      View your order history and track current orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/account/orders">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          View All Orders
                        </Button>
                      </Link>
                      <Link href="/track-order">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Track Order
                        </Button>
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
                    <CardDescription>
                      Manage your saved items and wishlists
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/wishlist">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        View Wishlist
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Settings
                    </CardTitle>
                    <CardDescription>
                      Update your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/account/profile">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Edit Profile
                        </Button>
                      </Link>
                      <Link href="/account/password">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Change Password
                        </Button>
                      </Link>
                      <Link href="/account/addresses">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Manage Addresses
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      Account Actions
                    </CardTitle>
                    <CardDescription>
                      Manage your account and privacy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/account/privacy">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Privacy Settings
                        </Button>
                      </Link>
                      <Link href="/account/notifications">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Notification Preferences
                        </Button>
                      </Link>
                      <Link href="/auth/logout">
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                        >
                          Sign Out
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
