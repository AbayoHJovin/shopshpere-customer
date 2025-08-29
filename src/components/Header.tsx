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

const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  const handleSearch = (e: FormEvent, term: string) => {
    e.preventDefault();

    if (!term.trim()) return;

    const searchParams = new URLSearchParams();
    searchParams.set("searchTerm", term.trim());

    router.push(`/shop?${searchParams.toString()}`);

    setSearchTerm("");
    setMobileSearchTerm("");
    setIsSearchOpen(false);
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
    return `${user.firstName.charAt(0)}${user.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  useEffect(() => {
    const getCartCount = async () => {
      try {
        const count = await CartService.getCartItemsCount();
        setCartItemCount(count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
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

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="hidden sm:flex items-center justify-between py-2 text-sm border-b">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Free shipping on orders over $50
            </span>
          </div>
          <div className="flex items-center gap-4">
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
                <Button variant="ghost" size="icon" className="lg:hidden">
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
                    href="/categories"
                    className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/discounts"
                    className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors"
                  >
                    Discounts
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
          </div>

          <div className="hidden lg:block flex-1 max-w-3xl mx-8">
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
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
                <Link
                  href="/categories"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Categories
                </Link>
                <Link
                  href="/discounts"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Discounts
                </Link>
              </nav>
              <form
                onSubmit={(e) => handleSearch(e, searchTerm)}
                className="relative flex-1"
              >
                <Input
                  placeholder="Search products, brands, and more..."
                  className="pl-4 pr-12 h-10 rounded-lg border-2 focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 rounded-md"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/auth/login")}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => router.push("/auth/register")}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-4 lg:hidden">
            <form
              onSubmit={(e) => handleSearch(e, mobileSearchTerm)}
              className="relative"
            >
              <Input
                placeholder="Search products..."
                className="pl-4 pr-12 h-10 rounded-lg"
                autoFocus
                value={mobileSearchTerm}
                onChange={(e) => setMobileSearchTerm(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        <div className="pb-2 border-t pt-2 sm:hidden">
          <div className="flex items-center justify-around">
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
            <Link
              href="/categories"
              className="text-xs font-medium text-center hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/discounts"
              className="text-xs font-medium text-center hover:text-primary transition-colors"
            >
              Discounts
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
