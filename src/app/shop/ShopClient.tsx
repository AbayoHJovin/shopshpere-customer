"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import ProductFilters from "@/components/ProductFilters";
import ProductGrid from "@/components/ProductGrid";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Fix the searchTerm type in FilterState
interface FilterState {
  priceRange: number[];
  categories: string[];
  brands: string[];
  attributes: Record<string, string[]>;
  discountRanges: string[];
  gender: string | null;
  rating: number | null;
  inStock: boolean;
  searchTerm: string | null;
}

export function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    categories: [],
    brands: [],
    attributes: {},
    discountRanges: [],
    gender: null,
    rating: null,
    inStock: false,
    searchTerm: "",
  });
  const [isInitialized, setIsInitialized] = useState(false);
  // Add pagination and filter visibility state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  // Extract filters from URL on mount
  useEffect(() => {
    const parseUrlParams = () => {
      const urlFilters: FilterState = {
        priceRange: [0, 1000],
        categories: [],
        brands: [],
        attributes: {},
        discountRanges: [],
        gender: null,
        rating: null,
        inStock: false,
        searchTerm: "",
      };

      // Parse price range
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      if (minPrice && maxPrice) {
        urlFilters.priceRange = [parseInt(minPrice), parseInt(maxPrice)];
      }

      // Parse array values
      const arrayKeys = ["categories", "brands", "discountRanges"] as const;
      arrayKeys.forEach((key) => {
        const value = searchParams.get(key);
        if (value) {
          urlFilters[key] = value.split(",");
        }
      });

      // Parse attributes (special handling for nested object)
      const attributesParam = searchParams.get("attributes");
      if (attributesParam) {
        try {
          urlFilters.attributes = JSON.parse(
            decodeURIComponent(attributesParam)
          );
        } catch (error) {
          console.warn("Failed to parse attributes from URL:", error);
        }
      }

      // Parse string/number values
      urlFilters.gender = searchParams.get("gender");

      const ratingParam = searchParams.get("rating");
      if (ratingParam) {
        urlFilters.rating = parseInt(ratingParam);
      }

      // Parse boolean values
      urlFilters.inStock = searchParams.get("inStock") === "true";

      // Parse search term
      urlFilters.searchTerm = searchParams.get("search") || "";

      return urlFilters;
    };

    setFilters(parseUrlParams());
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(
    (newFilters: FilterState) => {
      const urlParams = new URLSearchParams();

      // Add price range
      if (newFilters.priceRange[0] > 0) {
        urlParams.set("minPrice", newFilters.priceRange[0].toString());
      }

      if (newFilters.priceRange[1] < 1000) {
        urlParams.set("maxPrice", newFilters.priceRange[1].toString());
      }

      // Add array values
      const arrayKeys = ["categories", "brands", "discountRanges"] as const;
      arrayKeys.forEach((key) => {
        if (newFilters[key]?.length > 0) {
          urlParams.set(key, newFilters[key].join(","));
        }
      });

      // Add string/number values
      if (newFilters.gender) {
        urlParams.set("gender", newFilters.gender);
      }

      if (newFilters.rating !== null) {
        urlParams.set("rating", newFilters.rating.toString());
      }

      // Add boolean values
      if (newFilters.inStock) {
        urlParams.set("inStock", "true");
      }

      // Add search term
      if (newFilters.searchTerm) {
        urlParams.set("search", newFilters.searchTerm);
      }

      // Update URL without reloading page
      const queryString = urlParams.toString()
        ? `?${urlParams.toString()}`
        : "";
      router.replace(`/shop${queryString}`, { scroll: false });
    },
    [router]
  );

  // Handle filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  };

  // Handle filter visibility toggle
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop header with mobile filters */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {filters.searchTerm
            ? `Search: "${filters.searchTerm}"`
            : "Shop All Products"}
        </h1>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="lg:hidden flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px]">
            <div className="py-4 h-[calc(100vh-2rem)] overflow-auto">
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop filters sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {isInitialized ? (
            <ProductGrid
              filters={filters}
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              showFilters={showFilters}
              onToggleFilters={handleToggleFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded aspect-square mb-2" />
                  <div className="bg-muted h-4 rounded w-3/4 mb-2" />
                  <div className="bg-muted h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
