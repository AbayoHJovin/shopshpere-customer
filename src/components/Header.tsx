"use client";
import { useState, FormEvent, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBarWithSuggestions } from "@/components/SearchBarWithSuggestions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartService } from "@/lib/cartService";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logout } from "@/lib/store/slices/authSlice";
import { DeliveryStatus } from "@/components/DeliveryStatus";

const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  const handleSearch = (e: FormEvent, term?: string) => {
    e.preventDefault();

    const searchQuery = term || searchTerm;
    if (!searchQuery.trim()) return;

    const searchParams = new URLSearchParams();
    searchParams.set("searchTerm", searchQuery.trim());

    router.push(`/shop?${searchParams.toString()}`);

    setSearchTerm("");
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";

    const firstName = user.firstName || user.userName || "";
    const lastName = user.lastName || "";

    if (!firstName && !lastName) return "U";

    const firstInitial = firstName.charAt(0) || "";
    const lastInitial = lastName.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  };

  useEffect(() => {
    const getCartCount = async () => {
      try {
        const count = await CartService.getCartItemsCount();
        setCartItemCount(count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartItemCount(0);
      }
    };

    getCartCount();

    const handleStorageChange = () => {
      getCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  // Refresh cart count when authentication state changes
  useEffect(() => {
    const getCartCount = async () => {
      try {
        const count = await CartService.getCartItemsCount();
        setCartItemCount(count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartItemCount(0);
      }
    };

    getCartCount();
  }, [isAuthenticated]);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="hidden sm:flex items-center justify-between py-2 text-sm border-b">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Free shipping on orders over $60
            </span>
          </div>
          <div className="flex items-center gap-4">
            <DeliveryStatus />
            <span className="text-muted-foreground">Help</span>
            <Link
              href="/track-order"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <SheetHeader className="mb-6">
                  <SheetTitle>ShopSphere</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4">
                  <Link
                    href="/"
                    className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                  >
                    Shop
                  </Link>
                  <Link
                    href="/track-order"
                    className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                  >
                    Track Order
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/account"
                        className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/wishlist"
                        className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                ShopSphere
              </h1>
            </Link>

            {/* Navigation links close to logo */}
            <nav className="hidden md:flex items-center gap-4 ml-6">
              <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Shop
              </Link>
            </nav>
          </div>

          {/* Search Bar - Full width between navigation and actions */}
          <div className="hidden md:flex flex-1 mx-6">
            <SearchBarWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={(e, term) => handleSearch(e, term)}
              placeholder="Search products..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex"
              onClick={() => router.push("/wishlist")}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/account/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => router.push("/auth/login")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="text-xs hidden sm:flex sm:text-sm px-2 sm:px-4"
                  onClick={() => router.push("/auth/register")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation and Search */}
        <div className="pb-2 border-t pt-2 md:hidden">
          <div className="flex items-center justify-around mb-3">
            <Link
              href="/"
              className="text-xs font-medium text-center hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-xs font-medium text-center hover:text-primary transition-colors"
            >
              Shop
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <div className="px-2">
            <SearchBarWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={(e, term) => handleSearch(e, term)}
              placeholder="Search products..."
              className="w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
