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

      // Parse price range - with better validation
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      if (
        minPrice &&
        maxPrice &&
        minPrice !== "undefined" &&
        maxPrice !== "undefined" &&
        minPrice !== "null" &&
        maxPrice !== "null" &&
        minPrice.trim() !== "" &&
        maxPrice.trim() !== ""
      ) {
        const min = parseInt(minPrice);
        const max = parseInt(maxPrice);
        if (!isNaN(min) && !isNaN(max) && min >= 0 && max >= 0) {
          urlFilters.priceRange = [min, max];
        }
      }

      // Parse array values - with better validation
      const arrayKeys = ["categories", "brands", "discountRanges"] as const;
      arrayKeys.forEach((key) => {
        const value = searchParams.get(key);
        if (
          value &&
          value !== "undefined" &&
          value !== "null" &&
          value.trim() !== ""
        ) {
          // Split and filter out any invalid values
          const values = value
            .split(",")
            .filter(
              (item) =>
                item !== undefined &&
                item !== null &&
                item !== "undefined" &&
                item !== "null" &&
                item.trim() !== ""
            );
          if (values.length > 0) {
            urlFilters[key] = values;
          }
        }
      });

      // Parse attributes (special handling for nested object)
      const attributesParam = searchParams.get("attributes");
      if (
        attributesParam &&
        attributesParam !== "undefined" &&
        attributesParam !== "null" &&
        attributesParam.trim() !== ""
      ) {
        try {
          const parsed = JSON.parse(decodeURIComponent(attributesParam));
          if (parsed && typeof parsed === "object") {
            urlFilters.attributes = parsed;
          }
        } catch (error) {
          console.warn("Failed to parse attributes from URL:", error);
        }
      }

      // Parse string/number values - with better validation
      const genderParam = searchParams.get("gender");
      urlFilters.gender =
        genderParam &&
        genderParam !== "undefined" &&
        genderParam !== "null" &&
        genderParam.trim() !== ""
          ? genderParam
          : null;

      const ratingParam = searchParams.get("rating");
      if (
        ratingParam &&
        ratingParam !== "undefined" &&
        ratingParam !== "null" &&
        ratingParam.trim() !== ""
      ) {
        const rating = parseInt(ratingParam);
        if (!isNaN(rating) && rating >= 0) {
          urlFilters.rating = rating;
        }
      }

      // Parse boolean values
      const inStockParam = searchParams.get("inStock");
      urlFilters.inStock = inStockParam === "true";

      // Parse search term - with better validation
      const searchParam = searchParams.get("search");
      urlFilters.searchTerm =
        searchParam && searchParam !== "undefined" && searchParam !== "null"
          ? searchParam.trim()
          : "";

      return urlFilters;
    };

    setFilters(parseUrlParams());
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(
    (newFilters: FilterState) => {
      const urlParams = new URLSearchParams();

      // Add price range - only if values are valid numbers
      if (
        newFilters.priceRange[0] > 0 &&
        newFilters.priceRange[0] !== undefined &&
        newFilters.priceRange[0] !== null
      ) {
        urlParams.set("minPrice", newFilters.priceRange[0].toString());
      }

      if (
        newFilters.priceRange[1] < 1000 &&
        newFilters.priceRange[1] !== undefined &&
        newFilters.priceRange[1] !== null
      ) {
        urlParams.set("maxPrice", newFilters.priceRange[1].toString());
      }

      // Add array values - only if arrays exist and have valid items
      const arrayKeys = ["categories", "brands", "discountRanges"] as const;
      arrayKeys.forEach((key) => {
        if (
          newFilters[key] &&
          Array.isArray(newFilters[key]) &&
          newFilters[key].length > 0
        ) {
          // Filter out any undefined/null values from the array
          const validValues = newFilters[key].filter(
            (item) => item !== undefined && item !== null && item !== ""
          );
          if (validValues.length > 0) {
            urlParams.set(key, validValues.join(","));
          }
        }
      });

      // Add string/number values - only if they are valid
      if (
        newFilters.gender &&
        newFilters.gender !== undefined &&
        newFilters.gender !== null &&
        newFilters.gender !== ""
      ) {
        urlParams.set("gender", newFilters.gender);
      }

      if (
        newFilters.rating !== null &&
        newFilters.rating !== undefined &&
        !isNaN(newFilters.rating)
      ) {
        urlParams.set("rating", newFilters.rating.toString());
      }

      // Add boolean values
      if (newFilters.inStock === true) {
        urlParams.set("inStock", "true");
      }

      // Add search term - only if it's a valid string
      if (
        newFilters.searchTerm &&
        newFilters.searchTerm.trim() !== "" &&
        newFilters.searchTerm !== undefined &&
        newFilters.searchTerm !== null
      ) {
        urlParams.set("search", newFilters.searchTerm.trim());
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
