"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import ProductFilters from "@/components/ProductFilters";
import ProductGrid from "@/components/ProductGrid";
import { SearchBarWithSuggestions } from "@/components/SearchBarWithSuggestions";
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
  selectedDiscounts: string[];
  rating: number | null;
  inStock: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
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
    selectedDiscounts: [],
    rating: null,
    inStock: true,
    isBestseller: false,
    isFeatured: false,
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
        selectedDiscounts: [],
        rating: null,
        inStock: true,
        isBestseller: false,
        isFeatured: false,
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

      // Parse categories
      const categoriesParam = searchParams.get("categories");
      if (
        categoriesParam &&
        categoriesParam !== "undefined" &&
        categoriesParam !== "null" &&
        categoriesParam.trim() !== ""
      ) {
        const values = categoriesParam
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
          urlFilters.categories = values;
        }
      }

      // Parse brands
      const brandsParam = searchParams.get("brands");
      if (
        brandsParam &&
        brandsParam !== "undefined" &&
        brandsParam !== "null" &&
        brandsParam.trim() !== ""
      ) {
        const values = brandsParam
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
          urlFilters.brands = values;
        }
      }

      // Parse discounts
      const discountsParam = searchParams.get("discounts");
      if (
        discountsParam &&
        discountsParam !== "undefined" &&
        discountsParam !== "null" &&
        discountsParam.trim() !== ""
      ) {
        const values = discountsParam
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
          urlFilters.selectedDiscounts = values;
          console.log("Parsed discounts from URL:", values);
        }
      }

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
      urlFilters.inStock = inStockParam !== "false";

      const isBestsellerParam = searchParams.get("isBestseller");
      urlFilters.isBestseller = isBestsellerParam === "true";

      const isFeaturedParam = searchParams.get("isFeatured");
      urlFilters.isFeatured = isFeaturedParam === "true";

      // Parse search term - with better validation
      const searchParam =
        searchParams.get("searchTerm") || searchParams.get("search");
      urlFilters.searchTerm =
        searchParam && searchParam !== "undefined" && searchParam !== "null"
          ? searchParam.trim()
          : "";

      return urlFilters;
    };

    const parsedFilters = parseUrlParams();
    console.log("🔍 Parsed filters from URL:", parsedFilters);
    console.log("🔗 Current URL:", window.location.href);
    setFilters(parsedFilters);
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(
    (newFilters: FilterState) => {
      console.log("🔧 updateUrlWithFilters called with:", newFilters);
      const urlParams = new URLSearchParams();

      // Add price range - only if values are valid numbers
      if (
        newFilters.priceRange &&
        Array.isArray(newFilters.priceRange) &&
        newFilters.priceRange.length >= 2 &&
        newFilters.priceRange[0] > 0 &&
        newFilters.priceRange[0] !== undefined &&
        newFilters.priceRange[0] !== null
      ) {
        urlParams.set("minPrice", newFilters.priceRange[0].toString());
      }

      if (
        newFilters.priceRange &&
        Array.isArray(newFilters.priceRange) &&
        newFilters.priceRange.length >= 2 &&
        newFilters.priceRange[1] < 1000 &&
        newFilters.priceRange[1] !== undefined &&
        newFilters.priceRange[1] !== null
      ) {
        urlParams.set("maxPrice", newFilters.priceRange[1].toString());
      }

      // Add categories - only if array exists and has valid items
      if (
        newFilters.categories &&
        Array.isArray(newFilters.categories) &&
        newFilters.categories.length > 0
      ) {
        const validCategories = newFilters.categories.filter(
          (item) => item !== undefined && item !== null && item !== ""
        );
        if (validCategories.length > 0) {
          urlParams.set("categories", validCategories.join(","));
          console.log("✅ Added categories to URL:", validCategories);
        }
      } else {
        console.log(
          "❌ Categories not added - invalid or empty:",
          newFilters.categories
        );
      }

      // Add brands - only if array exists and has valid items
      if (
        newFilters.brands &&
        Array.isArray(newFilters.brands) &&
        newFilters.brands.length > 0
      ) {
        const validBrands = newFilters.brands.filter(
          (item) => item !== undefined && item !== null && item !== ""
        );
        if (validBrands.length > 0) {
          urlParams.set("brands", validBrands.join(","));
        }
      }

      // Handle selectedDiscounts separately with 'discounts' URL parameter
      if (
        newFilters.selectedDiscounts &&
        Array.isArray(newFilters.selectedDiscounts) &&
        newFilters.selectedDiscounts.length > 0
      ) {
        const validDiscounts = newFilters.selectedDiscounts.filter(
          (item) => item !== undefined && item !== null && item !== ""
        );
        if (validDiscounts.length > 0) {
          urlParams.set("discounts", validDiscounts.join(","));
          console.log("Setting discounts URL parameter:", validDiscounts);
        }
      }

      // Add attributes - only if object exists and has valid entries
      if (
        newFilters.attributes &&
        typeof newFilters.attributes === "object" &&
        Object.keys(newFilters.attributes).length > 0
      ) {
        try {
          const encodedAttributes = encodeURIComponent(
            JSON.stringify(newFilters.attributes)
          );
          urlParams.set("attributes", encodedAttributes);
          console.log("✅ Added attributes to URL:", newFilters.attributes);
        } catch (error) {
          console.warn("Failed to encode attributes for URL:", error);
        }
      } else {
        console.log(
          "❌ Attributes not added - invalid or empty:",
          newFilters.attributes
        );
      }

      // Add string/number values - only if they are valid
      if (
        newFilters.rating !== null &&
        newFilters.rating !== undefined &&
        !isNaN(newFilters.rating)
      ) {
        urlParams.set("rating", newFilters.rating.toString());
      }

      // Add boolean values
      if (newFilters.inStock === false) {
        urlParams.set("inStock", "false");
      }

      if (newFilters.isBestseller === true) {
        urlParams.set("isBestseller", "true");
      }

      if (newFilters.isFeatured === true) {
        urlParams.set("isFeatured", "true");
      }

      // Add search term - only if it's a valid string
      if (
        newFilters.searchTerm &&
        newFilters.searchTerm.trim() !== "" &&
        newFilters.searchTerm !== undefined &&
        newFilters.searchTerm !== null
      ) {
        urlParams.set("searchTerm", newFilters.searchTerm.trim());
      }

      // Update URL without reloading page
      const queryString = urlParams.toString()
        ? `?${urlParams.toString()}`
        : "";
      const newUrl = `/shop${queryString}`;
   
      router.replace(newUrl, { scroll: false });
    },
    [router]
  );

  // Handle filters change
  const handleFiltersChange = (
    newFilters: FilterState | ((prevFilters: FilterState) => FilterState)
  ) => {

    const resolvedFilters =
      typeof newFilters === "function" ? newFilters(filters) : newFilters;

    setFilters(resolvedFilters);
    updateUrlWithFilters(resolvedFilters);
  };

  // Handle filter visibility toggle
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, 1000],
      categories: [],
      brands: [],
      attributes: {},
      selectedDiscounts: [],
      rating: null,
      inStock: true,
      isBestseller: false,
      isFeatured: false,
      searchTerm: "",
    };
    handleFiltersChange(clearedFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent, term?: string) => {
    e.preventDefault();
    const searchTerm = term || filters.searchTerm;
    if (searchTerm && searchTerm.trim() !== "") {
      const newFilters = { ...filters, searchTerm: searchTerm.trim() };
      handleFiltersChange(newFilters);
    }
  };

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, searchTerm: value };
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">

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
              onClearAllFilters={handleClearAllFilters}
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
