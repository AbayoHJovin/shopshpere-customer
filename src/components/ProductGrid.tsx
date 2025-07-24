import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, Filter, List, Star, ShoppingCart, Check } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { allProducts } from "@/data/products";

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

interface ProductGridProps {
  filters: FilterState;
  currentPage: number;
  productsPerPage: number;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const ProductGrid = ({
  filters,
  currentPage,
  productsPerPage,
  showFilters,
  onToggleFilters
}: ProductGridProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  const [sortedProducts, setSortedProducts] = useState([...allProducts]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  
  // Load cart items on mount
  useEffect(() => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
    }
    
    // Add listener for storage events to keep cart in sync
    const handleStorageChange = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          setCartItems(JSON.parse(cartData));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error processing storage event:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
        const newCart = cart.filter(id => id !== productId);
        localStorage.setItem('cart', JSON.stringify(newCart));
        setCartItems(newCart);
      } else {
        // Add to cart
        const newCart = [...cart, productId];
        localStorage.setItem('cart', JSON.stringify(newCart));
        setCartItems(newCart);
      }
      
      // Dispatch storage event for other components to detect changes
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  // Apply filters and sorting when they change
  useEffect(() => {
    setIsLoading(true);
    
    // Give a slight delay to show loading state
    setTimeout(() => {
      const filtered = applyFilters(allProducts, filters);
      const sorted = applySorting(filtered, sortBy);
      setSortedProducts(sorted);
      setIsLoading(false);
    }, 300);
  }, [filters, sortBy]);
  
  // Paginate products
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);
  
  const handleSortChange = (value: string) => {
    setIsLoading(true);
    setSortBy(value);
  };

  // Apply filters to products
  function applyFilters(products: any[], filters: FilterState) {
    return products.filter(product => {
      // Filter by price range
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Filter by categories
      if (filters.categories.length > 0 && !filters.categories.some((cat: string) => 
        product.categories?.includes(cat)
      )) {
        return false;
      }

      // Filter by discount ranges
      if (filters.discountRanges?.length > 0) {
        if (!product.discount) return false;
        
        const hasMatchingDiscountRange = filters.discountRanges.some((range: string) => {
          if (range.includes('-')) {
            // Handle ranges like "1% - 20%"
            const [minStr, maxStr] = range.replace('%', '').split(' - ');
            const min = parseInt(minStr);
            const max = parseInt(maxStr);
            return product.discount >= min && product.discount <= max;
          } else if (range.includes('Over')) {
            // Handle "Over 60%" format
            const threshold = parseInt(range.match(/\d+/)?.[0] || '0');
            return product.discount > threshold;
          }
          return false;
        });
        
        if (!hasMatchingDiscountRange) return false;
      }

      // Filter by colors
      if (filters.colors?.length > 0 && !filters.colors.some((color: string) => 
        product.colors?.includes(color)
      )) {
        return false;
      }

      // Filter by sizes
      if (filters.sizes?.length > 0 && !filters.sizes.some((size: string) => 
        product.sizes?.includes(size)
      )) {
        return false;
      }

      // Filter by rating
      if (filters.rating !== null && product.rating < filters.rating) {
        return false;
      }

      // Filter by in-stock status
      if (filters.inStock && !product.inStock) {
        return false;
      }

      // Filter by gender (if implemented)
      if (filters.gender && product.gender !== filters.gender) {
        return false;
      }

      return true;
    });
  }

  // Apply sorting to products
  function applySorting(products: any[], sortType: string) {
    const productsCopy = [...products];
    
    switch (sortType) {
      case 'price-low-high':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'newest':
        return productsCopy.sort((a, b) => a.isNew ? -1 : b.isNew ? 1 : 0);
      case 'rating':
        return productsCopy.sort((a, b) => b.rating - a.rating);
      case 'popularity':
        return productsCopy.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'relevance':
      default:
        // Keep bestsellers at the top for relevance
        return productsCopy.sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return 0;
        });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing <strong>{sortedProducts.length}</strong> products
          </span>
          {sortedProducts.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Page {currentPage}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center flex-1 sm:flex-auto">
            <span className="text-sm mr-2 hidden sm:inline-block">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[130px] sm:w-[160px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
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
      {isLoading ? (
        <div className={`grid gap-4 sm:gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {Array(Math.min(productsPerPage, 8)).fill(0).map((_, i) => (
            <div key={i} className={viewMode === "list" ? "flex gap-4" : ""}>
              <Skeleton className="aspect-square w-full rounded-md" />
              <div className={`mt-4 space-y-2 ${viewMode === "list" ? "flex-1" : ""}`}>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-12 text-center border rounded-md bg-muted/20">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-muted mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No products match your criteria</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search term.</p>
          <Button variant="outline" onClick={clearAllFilters}>Clear All Filters</Button>
        </div>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {paginatedProducts.map(product => (
            <div key={product.id}>
              {viewMode === "grid" ? (
                <ProductCard 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice || undefined}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  image={product.image}
                  discount={product.discount}
                  isNew={product.isNew}
                  isBestseller={product.isBestseller}
                />
              ) : (
                <div className="flex flex-col sm:flex-row border rounded-md overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="w-full sm:w-[180px] h-[180px] sm:h-auto">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="mb-2 flex items-center gap-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating) 
                                ? "fill-rating-star text-rating-star" 
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-lg font-bold text-price">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm ml-2 text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                      <Button 
                        size="sm" 
                        className={isInCart(product.id) ? 'bg-success hover:bg-success/90' : ''}
                        onClick={() => toggleCart(product.id)}
                      >
                        {isInCart(product.id) ? (
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
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function clearAllFilters() {
    // This would call the parent component's onFiltersChange with empty filters
    onToggleFilters();
  }
};

export default ProductGrid; 