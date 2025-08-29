import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  Filter,
  List,
  Star,
  ShoppingCart,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ProductService,
  ManyProductsDto,
  Page,
  ProductSearchDTO,
} from "@/lib/productService";
import { filterMappingService } from "@/lib/filterMappingService";

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

interface ProductGridProps {
  filters: FilterState;
  currentPage: number;
  productsPerPage: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onPageChange?: (page: number) => void;
}

const ProductGrid = ({
  filters,
  currentPage,
  productsPerPage,
  showFilters,
  onToggleFilters,
  onPageChange,
}: ProductGridProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Page<ManyProductsDto> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);

  // Load cart items on mount
  useEffect(() => {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
    }

    // Add listener for storage events to keep cart in sync
    const handleStorageChange = () => {
      try {
        const cartData = localStorage.getItem("cart");
        if (cartData) {
          setCartItems(JSON.parse(cartData));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error processing storage event:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Helper function to check if a product is in cart
  const isInCart = (productId: string): boolean => {
    return cartItems.includes(productId);
  };

  // Toggle cart status
  const toggleCart = (productId: string) => {
    try {
      const cart = [...cartItems];

      if (isInCart(productId)) {
        // Remove from cart
        const newCart = cart.filter((id) => id !== productId);
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCartItems(newCart);
      } else {
        // Add to cart
        const newCart = [...cart, productId];
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCartItems(newCart);
      }

      // Dispatch storage event for other components to detect changes
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  // Convert filters to backend search DTO (async now due to ID mapping)
  const createSearchDTO = async (): Promise<ProductSearchDTO> => {
    const searchDTO: ProductSearchDTO = {
      page: currentPage - 1, // Backend uses 0-based indexing
      size: productsPerPage,
      sortBy,
      sortDirection,
    };

    // Add search term
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      searchDTO.searchKeyword = filters.searchTerm.trim();
    }

    // Add categories with proper ID mapping
    if (filters.categories && filters.categories.length > 0) {
      try {
        const categoryIds = await filterMappingService.mapCategoryNamesToIds(
          filters.categories
        );
        if (categoryIds.length > 0) {
          searchDTO.categoryIds = categoryIds;
        } else {
          console.warn("No valid category IDs found for:", filters.categories);
          // Fallback: use category names directly if mapping fails
          searchDTO.categoryNames = filters.categories;
        }
      } catch (error) {
        console.error("Error mapping category names to IDs:", error);
        // Fallback: use category names directly
        searchDTO.categoryNames = filters.categories;
      }
    }

    // Add brands with proper ID mapping
    if (filters.brands && filters.brands.length > 0) {
      try {
        const brandIds = await filterMappingService.mapBrandNamesToIds(
          filters.brands
        );
        if (brandIds.length > 0) {
          searchDTO.brandIds = brandIds;
        } else {
          console.warn("No valid brand IDs found for:", filters.brands);
          // Fallback: use brand names directly if mapping fails
          searchDTO.brandNames = filters.brands;
        }
      } catch (error) {
        console.error("Error mapping brand names to IDs:", error);
        // Fallback: use brand names directly
        searchDTO.brandNames = filters.brands;
      }
    }

    // Add price range (use basePriceMin/Max as per backend)
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      searchDTO.basePriceMin = filters.priceRange[0];
      searchDTO.basePriceMax = filters.priceRange[1];
    }

    // Add rating filter (use averageRatingMin as per backend)
    if (filters.rating !== null) {
      searchDTO.averageRatingMin = filters.rating;
    }

    // Add in stock filter
    if (filters.inStock) {
      searchDTO.inStock = true;
    }

    // Add attributes as variant attributes
    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      const variantAttrs: string[] = [];
      Object.entries(filters.attributes).forEach(([type, values]) => {
        values.forEach((value) => {
          variantAttrs.push(`${type}:${value}`);
        });
      });
      if (variantAttrs.length > 0) {
        searchDTO.variantAttributes = variantAttrs;
      }
    }

    // Ensure we have at least one filter criterion to avoid backend validation error
    const hasAnyFilter =
      searchDTO.searchKeyword ||
      searchDTO.categoryIds?.length > 0 ||
      searchDTO.categoryNames?.length > 0 ||
      searchDTO.brandIds?.length > 0 ||
      searchDTO.brandNames?.length > 0 ||
      searchDTO.basePriceMin !== undefined ||
      searchDTO.basePriceMax !== undefined ||
      searchDTO.averageRatingMin !== undefined ||
      searchDTO.inStock !== undefined ||
      searchDTO.variantAttributes?.length > 0;

    if (!hasAnyFilter) {
      console.warn(
        "No valid filter criteria found, using getAllProducts instead"
      );
      throw new Error("No valid filter criteria");
    }

    console.log("Search DTO created:", searchDTO);
    return searchDTO;
  };

  // Check if we need to use search vs getAllProducts
  const hasActiveFilters = (): boolean => {
    return (
      !!filters.searchTerm ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000 ||
      filters.categories.length > 0 ||
      filters.brands?.length > 0 ||
      filters.discountRanges?.length > 0 ||
      (filters.attributes && Object.keys(filters.attributes).length > 0) ||
      !!filters.gender ||
      filters.rating !== null ||
      filters.inStock
    );
  };

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let productPage: Page<ManyProductsDto>;

      if (hasActiveFilters()) {
        // Use search endpoint when filters are applied
        const searchDTO = await createSearchDTO();
        productPage = await ProductService.searchProducts(searchDTO);
      } else {
        // Use getAllProducts when no filters
        productPage = await ProductService.getAllProducts(
          currentPage - 1,
          productsPerPage,
          sortBy,
          sortDirection
        );
      }

      setProducts(productPage);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products when filters, pagination, or sorting changes
  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, productsPerPage, sortBy, sortDirection]);

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortDirection] = value.split("-");
    setSortBy(newSortBy);
    setSortDirection(newSortDirection || "desc");
  };

  const handleRetry = () => {
    fetchProducts();
  };

  const clearAllFilters = () => {
    // This would need to be passed from parent component
    onToggleFilters();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Top Controls Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {Array(Math.min(productsPerPage, 8))
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square w-full rounded-md" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12 text-center border rounded-md bg-red-50">
        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="font-medium text-lg mb-2 text-red-700">
          Failed to Load Products
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const paginatedProducts = products?.content || [];
  const totalProducts = products?.totalElements || 0;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing <strong>{paginatedProducts.length}</strong> of{" "}
            <strong>{totalProducts}</strong> products
          </span>
          {totalProducts > 0 && (
            <Badge variant="outline" className="text-xs">
              Page {currentPage} of {products?.totalPages || 1}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center flex-1 sm:flex-auto">
            <span className="text-sm mr-2 hidden sm:inline-block">
              Sort by:
            </span>
            <Select
              value={`${sortBy}-${sortDirection}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[130px] sm:w-[160px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="finalPrice-asc">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="finalPrice-desc">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="rating-desc">Highest Rated</SelectItem>
                <SelectItem value="reviewCount-desc">Most Reviews</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden sm:flex items-center space-x-1 border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none rounded-l-md"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none rounded-r-md"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={onToggleFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="py-12 text-center border rounded-md bg-gray-50">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-lg mb-2">
            No products match your criteria
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search term.
          </p>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div
          className={`grid gap-4 sm:gap-6 ${
            viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {paginatedProducts.map((product) => {
            const convertedProduct =
              ProductService.convertToProductCardFormat(product);

            return (
              <div key={product.productId}>
                {viewMode === "grid" ? (
                  <ProductCard
                    id={convertedProduct.id}
                    name={convertedProduct.name}
                    price={convertedProduct.price}
                    originalPrice={convertedProduct.originalPrice}
                    rating={convertedProduct.rating}
                    reviewCount={convertedProduct.reviewCount}
                    image={convertedProduct.image}
                    discount={convertedProduct.discount}
                    isNew={convertedProduct.isNew}
                    isBestseller={convertedProduct.isBestseller}
                    discountedPrice={convertedProduct.discountedPrice}
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row border rounded-md overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                    <div className="w-full sm:w-[180px] h-[180px] sm:h-auto">
                      <img
                        src={convertedProduct.image}
                        alt={convertedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {convertedProduct.name}
                      </h3>
                      <div className="mb-2 flex items-center gap-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(convertedProduct.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({convertedProduct.reviewCount})
                        </span>
                      </div>
                      <div className="mb-3">
                        <span className="text-lg font-bold text-primary">
                          ${convertedProduct.price}
                        </span>
                        {convertedProduct.originalPrice && (
                          <span className="text-sm ml-2 text-gray-500 line-through">
                            ${convertedProduct.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-auto">
                        <Button
                          size="sm"
                          className={
                            isInCart(convertedProduct.id)
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                          onClick={() => toggleCart(convertedProduct.id)}
                        >
                          {isInCart(convertedProduct.id) ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Added to Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
