"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  CalendarDays,
  Tag,
  TagsIcon,
  Zap,
  ChevronDown,
  PercentIcon,
  Filter,
  RefreshCw,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import {
  getDiscountById,
  getDiscountProducts,
  Discount,
} from "@/data/discounts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProductFilters from "@/components/ProductFilters";

// Define filter state interface to match ProductFilters
interface FilterState {
  priceRange: number[];
  categories: string[];
  colors: string[];
  sizes: string[];
  discountRanges: string[];
  gender: string | null;
  rating: number | null;
  inStock: boolean;
}

export default function DiscountPage({
  params,
}: {
  params: { discountId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    categories: [],
    colors: [],
    sizes: [],
    discountRanges: [],
    gender: null,
    rating: null,
    inStock: false,
  });

  // Parse URL parameters and set filters on mount
  useEffect(() => {
    const parseUrlParams = () => {
      const params = new URLSearchParams(searchParams.toString());
      const urlFilters = { ...filters };

      // Parse price range
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      if (minPrice && maxPrice) {
        urlFilters.priceRange = [parseInt(minPrice), parseInt(maxPrice)];
      }

      // Parse array values
      const arrayKeys = [
        "categories",
        "colors",
        "sizes",
        "discountRanges",
      ] as const;
      arrayKeys.forEach((key) => {
        const value = params.get(key);
        if (value) {
          urlFilters[key] = value.split(",");
        }
      });

      // Parse string/number values
      if (params.get("gender")) urlFilters.gender = params.get("gender");

      const ratingParam = params.get("rating");
      if (ratingParam) urlFilters.rating = parseInt(ratingParam);

      // Parse boolean values
      if (params.get("inStock"))
        urlFilters.inStock = params.get("inStock") === "true";

      return urlFilters;
    };

    setFilters(parseUrlParams());
  }, [searchParams]);

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(
    (newFilters: FilterState) => {
      const urlParams = new URLSearchParams(searchParams.toString());

      // Add price range
      if (newFilters.priceRange[0] > 0)
        urlParams.set("minPrice", newFilters.priceRange[0].toString());
      else urlParams.delete("minPrice");

      if (newFilters.priceRange[1] < 1000)
        urlParams.set("maxPrice", newFilters.priceRange[1].toString());
      else urlParams.delete("maxPrice");

      // Add array values
      const arrayKeys = [
        "categories",
        "colors",
        "sizes",
        "discountRanges",
      ] as const;
      arrayKeys.forEach((key) => {
        if (newFilters[key]?.length > 0) {
          urlParams.set(key, newFilters[key].join(","));
        } else {
          urlParams.delete(key);
        }
      });

      // Add string/number values
      if (newFilters.gender) urlParams.set("gender", newFilters.gender);
      else urlParams.delete("gender");

      if (newFilters.rating !== null)
        urlParams.set("rating", newFilters.rating.toString());
      else urlParams.delete("rating");

      // Add boolean values
      if (newFilters.inStock) urlParams.set("inStock", "true");
      else urlParams.delete("inStock");

      // Update URL without reloading page - use the current discount ID from route params
      const queryString = urlParams.toString()
        ? `?${urlParams.toString()}`
        : "";
      router.replace(`/discounts/${params.discountId}${queryString}`, {
        scroll: false,
      });
    },
    [searchParams, router, params.discountId]
  );

  useEffect(() => {
    // Get discount data
    const discountData = getDiscountById(params.discountId);

    if (discountData) {
      setDiscount(discountData);

      // Get products for this discount
      const discountProducts = getDiscountProducts(discountData);
      setProducts(discountProducts);

      // Apply any existing filters
      applyFilters(discountProducts, filters);
    } else {
      // Discount not found, redirect to discounts page
      router.push("/discounts");
    }

    setIsLoading(false);
  }, [params.discountId, router]);

  // Apply filters to products
  const applyFilters = (products: any[], filters: FilterState) => {
    let filtered = [...products];

    // Filter by price range
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      filtered = filtered.filter(
        (p) =>
          p.discountedPrice >= filters.priceRange[0] &&
          p.discountedPrice <= filters.priceRange[1]
      );
    }

    // Filter by categories if user selected any
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        p.categories?.some((c: string) => filters.categories.includes(c))
      );
    }

    // Filter by colors
    if (filters.colors?.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((c: string) => filters.colors.includes(c))
      );
    }

    // Filter by sizes
    if (filters.sizes?.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((s: string) => filters.sizes.includes(s))
      );
    }

    // Filter by rating
    if (filters.rating !== null) {
      // Safe to use since we've checked for null
      filtered = filtered.filter((p) => p.rating >= (filters.rating as number));
    }

    // Filter by availability
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock === true);
    }

    setFilteredProducts(filtered);
  };

  // Format a date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Calculate remaining time until end date
  const getRemainingTime = (endDate: Date) => {
    if (!endDate) return "";

    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    // If already expired
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ${hours} hour${
        hours !== 1 ? "s" : ""
      }`;
    } else {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    applyFilters(products, newFilters);
    updateUrlWithFilters(newFilters);
  };

  // Default filters for reset
  const defaultFilters: FilterState = {
    priceRange: [0, 1000],
    categories: [],
    colors: [],
    sizes: [],
    discountRanges: [],
    gender: null,
    rating: null,
    inStock: false,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl">
          <div className="h-12 bg-muted rounded-lg w-1/3"></div>
          <div className="h-32 bg-muted rounded-lg w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Discount not found</h2>
        <p className="text-muted-foreground mb-6">
          The discount you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push("/discounts")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discounts
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Discount Banner */}
      <div className={`relative bg-gradient-to-br from-primary to-accent text-white mt-0`}>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Button
                variant="ghost"
                className="mb-4 text-white hover:bg-white/20 hover:text-white"
                onClick={() => router.push("/discounts")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Discounts
              </Button>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {discount.title}
              </h1>

              <p className="text-lg md:text-xl opacity-90 max-w-xl">
                {discount.description}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Badge className="bg-white/20 text-white border-white/40 hover:bg-white/30 flex items-center gap-1">
                  <PercentIcon className="h-3 w-3" />
                  {discount.discountPercentage}% OFF
                </Badge>

                {discount.isFlashSale && (
                  <Badge className="bg-destructive/90 text-destructive-foreground border-destructive/50 hover:bg-destructive flex items-center gap-1 animate-pulse">
                    <Zap className="h-3 w-3" />
                    Flash Sale
                  </Badge>
                )}

                <Badge className="bg-white/20 text-white border-white/40 hover:bg-white/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getRemainingTime(discount.endDate)} left
                </Badge>

                {discount.code && (
                  <Badge className="bg-white text-primary border-white hover:bg-white/90 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Code: {discount.code}
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">Valid From</h3>
                <div className="flex items-center gap-2 justify-center">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(discount.startDate)}</span>
                </div>

                <Separator className="my-3 bg-white/20" />

                <h3 className="text-lg font-semibold mb-1">Expires On</h3>
                <div className="flex items-center gap-2 justify-center">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(discount.endDate)}</span>
                </div>
              </div>
            </div>
            {/* Wave SVG */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden">
              <svg
                className="relative block w-full h-[50px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                  className="fill-background"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Products with {discount.discountPercentage}% OFF
            <span className="text-sm text-muted-foreground ml-2 font-normal">
              {filteredProducts.length} products found
            </span>
          </h2>

          <div className="flex items-center gap-4">
            {/* Mobile filters */}
            <div className="lg:hidden">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-md">
                  <div className="py-4 h-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4">
                      Product Filters
                    </h2>
                    <ProductFilters
                      filters={filters}
                      onFiltersChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange(defaultFilters)}
              className="hidden md:flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Product grid with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar filters - desktop only */}
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    discount={discount.discountPercentage}
                    discountedPrice={product.discountedPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="text-xl font-semibold mb-2">
                  No products match your filters
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or browse all products in this
                  discount.
                </p>
                <Button onClick={() => handleFilterChange(defaultFilters)}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
