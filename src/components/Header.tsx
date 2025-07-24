"use client"
import { useState, FormEvent, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, Heart, X } from "lucide-react";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartService } from "@/lib/cartService";

const Header = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  const handleSearch = (e: FormEvent, term: string) => {
    e.preventDefault();
    
    if (!term.trim()) return;
    
    // Build the URL with search parameters
    const searchParams = new URLSearchParams();
    searchParams.set('searchTerm', term.trim());
    
    // Navigate to shop page with search params
    router.push(`/shop?${searchParams.toString()}`);
    
    // Reset the search fields
    setSearchTerm("");
    setMobileSearchTerm("");
    setIsSearchOpen(false);
  };

  // Get cart item count on mount and when cart changes
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

    // Listen for changes to localStorage
    const handleStorageChange = () => {
      getCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for cart updates
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar - Hide on extra small screens, show on sm+ */}
        <div className="hidden sm:flex items-center justify-between py-2 text-sm border-b">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Help</span>
            <span className="text-muted-foreground">Track Order</span>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and mobile menu */}
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
                  <Link href="/" className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link href="/shop" className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors">
                    Shop
                  </Link>
                  <Link href="/categories" className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors">
                    Categories
                  </Link>
                  <Link href="/discounts" className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors">
                    Discounts
                  </Link>
                  <Link href="#" className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors">
                    Help
                  </Link>
                  <Link href="#" className="text-lg font-medium px-2 py-1 hover:text-primary transition-colors">
                    Track Order
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                ShopSphere
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden lg:block flex-1 max-w-3xl mx-8">
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">
                  Shop
                </Link>
                <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                  Categories
                </Link>
                <Link href="/discounts" className="text-sm font-medium hover:text-primary transition-colors">
                  Discounts
                </Link>
              </nav>
              <form onSubmit={(e) => handleSearch(e, searchTerm)} className="relative flex-1">
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

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile search trigger */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Wishlist button - hide on xs, show on sm+ */}
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex relative">
              <Heart className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
            
            {/* Cart button */}
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
            
            {/* User button */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search - show only when search is active */}
        {isSearchOpen && (
          <div className="pb-4 lg:hidden">
            <form onSubmit={(e) => handleSearch(e, mobileSearchTerm)} className="relative">
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

        {/* Mobile navigation - shown on small screens only */}
        <div className="pb-2 border-t pt-2 sm:hidden">
          <div className="flex items-center justify-around">
            <Link href="/" className="text-xs font-medium text-center hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-xs font-medium text-center hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/categories" className="text-xs font-medium text-center hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/discounts" className="text-xs font-medium text-center hover:text-primary transition-colors">
              Discounts
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 