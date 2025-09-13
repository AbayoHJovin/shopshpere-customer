"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logout } from "@/lib/store/slices/authSlice";
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
  AlertCircle,
  Gift,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/services/authService";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUserData(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch user data");
        }
      } catch (err: any) {
        console.error("Error fetching user data:", err);

        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("unauthorized");
        } else {
          setError("Failed to load account information. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    } else {
      setError("unauthorized");
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const getUserInitials = () => {
    if (!userData) return "U";

    const firstName = userData.firstName || userData.userName || "";
    const lastName = userData.lastName || "";

    if (!firstName && !lastName) return "U";

    const firstInitial = firstName.charAt(0) || "";
    const lastInitial = lastName.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading account information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (error === "unauthorized" || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to view your account information.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && error !== "unauthorized") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Error Loading Account
                </h2>
                <p className="text-muted-foreground mb-6">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show account page
  return (
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
                  {userData?.firstName || userData?.userName || "User"}{" "}
                  {userData?.lastName || ""}
                </CardTitle>
                <CardDescription>{userData?.email}</CardDescription>
                <Badge
                  variant={userData?.isActive ? "default" : "secondary"}
                  className="mt-2"
                >
                  {userData?.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{userData?.email}</span>
                  </div>
                  {userData?.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.phoneNumber}</span>
                    </div>
                  )}
                  {userData?.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(userData.dateOfBirth)}</span>
                    </div>
                  )}
                  {userData?.gender && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {userData.gender.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Member since{" "}
                    {userData?.createdAt
                      ? formatDate(userData.createdAt)
                      : "N/A"}
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
                    <Button variant="outline" className="w-full justify-start">
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
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Reward System
                  </CardTitle>
                  <CardDescription>
                    Learn about our reward system and earn points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/reward-system">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        How Rewards Work
                      </Button>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      <p>• Earn 1 point per $1 spent</p>
                      <p>• Redeem 100 points = $1 discount</p>
                      <p>• Unlock tier benefits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Info
                  </CardTitle>
                  <CardDescription>
                    Understand shipping costs and delivery options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/shipping-info">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        Shipping Calculator
                      </Button>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      <p>• Free shipping on orders over $50</p>
                      <p>• Standard: $2.99 (3-5 days)</p>
                      <p>• Express: $6.99 (1-2 days)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
