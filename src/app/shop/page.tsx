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

// Default filter state - used as base for URL parsing
const defaultFilters: FilterState = {
  priceRange: [0, 1000],
  categories: [],
  colors: [],
  sizes: [],
  discountRanges: [],
  gender: null,
  rating: null,
  inStock: false
};

export default function Shop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Parse URL parameters and return filter state
  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlFilters = {...defaultFilters}; // Use defaultFilters instead of current state
    
    // Parse price range
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    if (minPrice && maxPrice) {
      urlFilters.priceRange = [parseInt(minPrice), parseInt(maxPrice)];
    }
    
    // Parse array values
    const arrayKeys = ['categories', 'colors', 'sizes', 'discountRanges'] as const;
    arrayKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        urlFilters[key] = value.split(',');
      }
    });
    
    // Check for single category parameter (for direct linking)
    const category = params.get('category');
    if (category && !params.get('categories')) {
      urlFilters.categories = [category];
    }
    
    // Parse string/number values
    if (params.get('gender')) urlFilters.gender = params.get('gender');
    
    const ratingParam = params.get('rating');
    if (ratingParam) urlFilters.rating = parseInt(ratingParam);
    
    // Parse boolean values
    if (params.get('inStock')) urlFilters.inStock = params.get('inStock') === 'true';
    
    // Parse page number
    let page = 1;
    const pageParam = params.get('page');
    if (pageParam) page = parseInt(pageParam);
    
    return { filters: urlFilters, page };
  }, [searchParams]); // Remove filters from dependency array

  // Initialize filters from URL params when component mounts or URL changes
  useEffect(() => {
    const { filters: urlFilters, page } = parseUrlParams();
    setFilters(urlFilters);
    setCurrentPage(page);
    setIsInitialized(true);
  }, [parseUrlParams]);

  // Update URL when filters change - this should NOT be in the render cycle
  const updateUrlWithFilters = useCallback((newFilters: FilterState, page: number) => {
    const params = new URLSearchParams();
    
    // Add price range
    if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 1000) params.set('maxPrice', newFilters.priceRange[1].toString());
    
    // Add array values
    const arrayKeys = ['categories', 'colors', 'sizes', 'discountRanges'] as const;
    arrayKeys.forEach(key => {
      if (newFilters[key].length > 0) {
        params.set(key, newFilters[key].join(','));
      }
    });
    
    // Add string/number values
    if (newFilters.gender) params.set('gender', newFilters.gender);
    if (newFilters.rating !== null) params.set('rating', newFilters.rating.toString());
    
    // Add boolean values
    if (newFilters.inStock) params.set('inStock', 'true');
    
    // Add page number if not 1
    if (page > 1) params.set('page', page.toString());
    
    // Update URL without reloading page
    const newUrl = params.toString() ? `/shop?${params.toString()}` : '/shop';
    router.replace(newUrl, { scroll: false });
  }, [router]);

  const productsPerPage = 12;
  const totalProducts = 234; // This would come from your API in a real app
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    updateUrlWithFilters(newFilters, 1); // Update URL with new filters and page 1
  }, [updateUrlWithFilters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateUrlWithFilters(filters, page); // Update URL with current filters and new page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateUrlWithFilters]);

  // Don't render content until filters are initialized from URL
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-muted rounded-md mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <div className="rounded-md bg-muted h-44 w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[69px] z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Shop All Products</h1>
              {filters.categories.length > 0 && (
                <p className="text-muted-foreground mt-1">
                  Showing results for <span className="font-medium text-primary">{filters.categories.join(', ')}</span>
                </p>
              )}
              {filters.categories.length === 0 && (
                <p className="text-muted-foreground mt-1">
                  Discover our complete collection of {totalProducts} products
                </p>
              )}
            </div>
            
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-md">
                  <div className="py-4 h-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4">Product Filters</h2>
                    <ProductFilters 
                      filters={filters}
                      onFiltersChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-36">
              <ProductFilters 
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-h-[800px]">
            <ProductGrid 
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              filters={filters}
              currentPage={currentPage}
              productsPerPage={productsPerPage}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex flex-wrap justify-center gap-1">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 