import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  PercentIcon,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { FilterService, FilterOptions, FilterError } from "@/lib/filterService";
import { discountService, DiscountInfo } from "@/lib/discountService";
import CountdownTimer from "@/components/CountdownTimer";

interface ProductFiltersProps {
  filters: any;
  onFiltersChange: (filters: any | ((prevFilters: any) => any)) => void;
}

const ProductFilters = ({ filters, onFiltersChange }: ProductFiltersProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [filterErrors, setFilterErrors] = useState<FilterError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const priceRangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Discount state
  const [activeDiscounts, setActiveDiscounts] = useState<DiscountInfo[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(true);
  const [discountsError, setDiscountsError] = useState<string | null>(null);

  // Load filter options from backend
  useEffect(() => {
    loadFilterOptions();
    loadActiveDiscounts();
  }, []);

  // Sync local price range with filters
  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const loadFilterOptions = async () => {
    setIsLoading(true);
    try {
      const { data, errors } = await FilterService.fetchAllFilterOptions();
      setFilterOptions(data);
      setFilterErrors(errors);

      if (errors.length > 0) {
        console.warn("Some filter options failed to load:", errors);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
      setFilterErrors([
        {
          type: "general",
          message: "Failed to load filter options. Please try again.",
          originalError: error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveDiscounts = async () => {
    setDiscountsLoading(true);
    setDiscountsError(null);
    try {
      const discounts = await discountService.getActiveDiscounts();
      setActiveDiscounts(discounts);
    } catch (error) {
      console.error("Error loading active discounts:", error);
      setDiscountsError("Failed to load active discounts");
      setActiveDiscounts([]);
    } finally {
      setDiscountsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setFilterErrors([]);
    loadFilterOptions();
    loadActiveDiscounts();
  };

  // Fallback data for when backend fails
  const fallbackData = {
    categories: [],
    brands: [],
    attributes: [],
    priceRange: { min: 0, max: 2000 },
  };

  // Get current data (backend or fallback)
  const currentData = filterOptions || fallbackData;

  // Colors and sizes are now handled through backend attributes

  const updateFilters = useCallback(
    (key: string, value: any) => {
      onFiltersChange((prevFilters: any) => {
        // Ensure prevFilters is not undefined and has proper structure
        const safePrevFilters = prevFilters || {
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
        return { ...safePrevFilters, [key]: value };
      });
    },
    [onFiltersChange]
  );

  // Debounced price range update
  const updatePriceRange = useCallback(
    (value: number[]) => {
      setLocalPriceRange(value);

      // Clear existing timeout
      if (priceRangeTimeoutRef.current) {
        clearTimeout(priceRangeTimeoutRef.current);
      }

      // Set new timeout
      priceRangeTimeoutRef.current = setTimeout(() => {
        updateFilters("priceRange", value);
      }, 500); // Increased debounce to 500ms
    },
    [updateFilters]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (priceRangeTimeoutRef.current) {
        clearTimeout(priceRangeTimeoutRef.current);
      }
    };
  }, []);

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  }, []);

  const toggleSection = useCallback((sectionName: string) => {
    setCollapsedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
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
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.categories.length > 0 ||
    filters.brands?.length > 0 ||
    filters.selectedDiscounts?.length > 0 ||
    (filters.attributes && Object.keys(filters.attributes).length > 0) ||
    filters.rating !== null ||
    filters.inStock === false ||
    filters.isBestseller === true ||
    filters.isFeatured === true ||
    (filters.searchTerm && filters.searchTerm.trim() !== "");

  const renderCategory = (category: any, level: number = 0) => {
    const isExpanded = expandedCategories.includes(category.name);
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;

    return (
      <div
        key={category.name || category.categoryId}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className="flex items-center space-x-2 py-1">
          {hasSubcategories && (
            <button
              onClick={() => toggleCategory(category.name)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasSubcategories && <div className="w-5" />}
          <Checkbox
            id={`category-${category.categoryId || category.name}`}
            checked={filters.categories.includes(category.name)}
            onCheckedChange={(checked) => {
              const newCategories = checked
                ? [...filters.categories, category.name]
                : filters.categories.filter((c: string) => c !== category.name);
              updateFilters("categories", newCategories);
            }}
          />
          <label
            htmlFor={`category-${category.categoryId || category.name}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
          >
            {category.name}
          </label>
          <span className="text-xs text-gray-500">
            ({category.productCount || category.count || 0})
          </span>
        </div>

        {hasSubcategories && isExpanded && (
          <div className="mt-1">
            {category.subcategories.map((subcategory: any) =>
              renderCategory(subcategory, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFilterSection = (title: string, content: React.ReactNode) => {
    const isCollapsed = collapsedSections.includes(title);

    return (
      <Card className="border shadow-sm">
        <CardHeader
          className="py-3 cursor-pointer"
          onClick={() => toggleSection(title)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{title}</CardTitle>
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        {!isCollapsed && <CardContent>{content}</CardContent>}
      </Card>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-150px)] overflow-y-auto pr-2 space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Loading filters...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-150px)] overflow-y-auto pr-2 space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-2">
        <h3 className="text-sm font-medium">Product Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-8 px-2 py-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset All
          </Button>
        )}
      </div>

      {/* Error Messages */}
      {filterErrors.length > 0 && (
        <Card className="border border-red-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm text-red-700">
                Filter Loading Issues
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filterErrors.map((error, index) => (
              <div
                key={index}
                className="text-sm text-red-600 bg-red-50 p-2 rounded"
              >
                <strong>{error.type}:</strong> {error.message}
              </div>
            ))}
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="mt-2 w-full"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Loading (
              {retryCount > 0 ? `Attempt ${retryCount + 1}` : "Retry"})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category: string) => (
                <Badge
                  key={`cat-${category}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {category}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() =>
                      updateFilters(
                        "categories",
                        filters.categories.filter((c: string) => c !== category)
                      )
                    }
                  />
                </Badge>
              ))}
              {filters.brands?.map((brand: string) => (
                <Badge
                  key={`brand-${brand}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {brand}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() =>
                      updateFilters(
                        "brands",
                        (filters.brands || []).filter(
                          (b: string) => b !== brand
                        )
                      )
                    }
                  />
                </Badge>
              ))}
              {filters.attributes &&
                Object.entries(filters.attributes).map(([type, values]) =>
                  (values as string[]).map((value: string) => (
                    <Badge
                      key={`attr-${type}-${value}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {type}: {value}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const currentAttributes = { ...filters.attributes };
                          const updatedValues = currentAttributes[type].filter(
                            (v: string) => v !== value
                          );
                          if (updatedValues.length === 0) {
                            delete currentAttributes[type];
                          } else {
                            currentAttributes[type] = updatedValues;
                          }
                          updateFilters("attributes", currentAttributes);
                        }}
                      />
                    </Badge>
                  ))
                )}
              {filters.selectedDiscounts?.map((discountId: string) => {
                const discount = activeDiscounts.find(
                  (d) => d.discountId === discountId
                );
                return (
                  <Badge
                    key={`discount-${discountId}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {discount?.name || discountId}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() =>
                        updateFilters(
                          "selectedDiscounts",
                          filters.selectedDiscounts.filter(
                            (d: string) => d !== discountId
                          )
                        )
                      }
                    />
                  </Badge>
                );
              })}
              {filters.inStock === false && (
                <Badge key="inStock" variant="secondary" className="text-xs">
                  Include Out of Stock
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("inStock", true)}
                  />
                </Badge>
              )}
              {filters.isBestseller && (
                <Badge
                  key="isBestseller"
                  variant="secondary"
                  className="text-xs"
                >
                  Bestseller
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("isBestseller", false)}
                  />
                </Badge>
              )}
              {filters.isFeatured && (
                <Badge key="isFeatured" variant="secondary" className="text-xs">
                  Featured
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("isFeatured", false)}
                  />
                </Badge>
              )}
              {filters.rating && (
                <Badge key="rating" variant="secondary" className="text-xs">
                  {filters.rating}+ Stars
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("rating", null)}
                  />
                </Badge>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <Badge key="price" variant="secondary" className="text-xs">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("priceRange", [0, 1000])}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range Filter */}
      {renderFilterSection(
        "Price Range",
        <div className="space-y-4">
          <Slider
            value={localPriceRange}
            onValueChange={updatePriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${localPriceRange[0]}</span>
            <span>
              ${localPriceRange[1]}
              {localPriceRange[1] === 1000 && "+"}
            </span>
          </div>
        </div>
      )}

      {/* Categories Filter */}
      {renderFilterSection(
        "Categories",
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {currentData.categories.length > 0 ? (
            currentData.categories.map((category) => renderCategory(category))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No categories available</p>
              {filterErrors.some((e) => e.type === "categories") && (
                <p className="text-xs mt-1">Failed to load categories</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Brands Filter */}
      {renderFilterSection(
        "Brands",
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {currentData.brands.length > 0 ? (
            currentData.brands.map((brand) => (
              <div key={brand.brandId} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.brandId}`}
                  checked={filters.brands?.includes(brand.brandName) || false}
                  onCheckedChange={(checked) => {
                    const newBrands = checked
                      ? [...(filters.brands || []), brand.brandName]
                      : (filters.brands || []).filter(
                          (b: string) => b !== brand.brandName
                        );
                    updateFilters("brands", newBrands);
                  }}
                />
                <label
                  htmlFor={`brand-${brand.brandId}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  {brand.brandName}
                </label>
                <span className="text-xs text-gray-500">
                  ({brand.productCount || 0})
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No brands available</p>
              {filterErrors.some((e) => e.type === "brands") && (
                <p className="text-xs mt-1">Failed to load brands</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Product Attributes Filter */}
      {currentData.attributes.length > 0 && (
        <div className="space-y-4">
          {currentData.attributes.map(
            ({ type, values }) =>
              values.length > 0 && (
                <div key={type.attributeTypeId}>
                  {renderFilterSection(
                    type.name,
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {values.map((value) => (
                        <div
                          key={value.attributeValueId}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`attr-${value.attributeValueId}`}
                            checked={
                              filters.attributes?.[type.name]?.includes(
                                value.value
                              ) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentAttributes =
                                filters.attributes || {};
                              const currentTypeValues =
                                currentAttributes[type.name] || [];
                              const newTypeValues = checked
                                ? [...currentTypeValues, value.value]
                                : currentTypeValues.filter(
                                    (v: string) => v !== value.value
                                  );

                              const newAttributes = {
                                ...currentAttributes,
                                [type.name]:
                                  newTypeValues.length > 0
                                    ? newTypeValues
                                    : undefined,
                              };

                              // Remove empty arrays
                              Object.keys(newAttributes).forEach((key) => {
                                if (
                                  !newAttributes[key] ||
                                  newAttributes[key].length === 0
                                ) {
                                  delete newAttributes[key];
                                }
                              });

                              updateFilters("attributes", newAttributes);
                            }}
                          />
                          <label
                            htmlFor={`attr-${value.attributeValueId}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                          >
                            {value.value}
                          </label>
                          <span className="text-xs text-gray-500">
                            ({value.productCount || 0})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
          )}
        </div>
      )}

      {/* Active Discounts Filter */}
      {activeDiscounts.length > 0 &&
        renderFilterSection(
          "Active Discounts",
          <div className="space-y-4">
            {discountsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="ml-2 text-sm text-gray-600">
                  Loading discounts...
                </span>
              </div>
            ) : discountsError ? (
              <div className="text-center py-4 text-red-500">
                <p className="text-sm">{discountsError}</p>
                <Button
                  onClick={loadActiveDiscounts}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            ) : (
              activeDiscounts.map((discount) => (
                <div
                  key={discount.discountId}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`discount-${discount.discountId}`}
                      checked={
                        filters.selectedDiscounts?.includes(
                          discount.discountId
                        ) || false
                      }
                      onCheckedChange={(checked) => {
                        const newSelectedDiscounts = checked
                          ? [
                              ...(filters.selectedDiscounts || []),
                              discount.discountId,
                            ]
                          : (filters.selectedDiscounts || []).filter(
                              (d: string) => d !== discount.discountId
                            );
                        updateFilters(
                          "selectedDiscounts",
                          newSelectedDiscounts
                        );
                      }}
                    />
                    <label
                      htmlFor={`discount-${discount.discountId}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <PercentIcon className="h-3 w-3 text-red-500" />
                        <span className="font-semibold">{discount.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          {discount.percentage}% OFF
                        </Badge>
                      </div>
                    </label>
                  </div>

                  {discount.description && (
                    <p className="text-xs text-gray-600 ml-6">
                      {discount.description}
                    </p>
                  )}

                  <div className="ml-6 space-y-2">
                    {/* Countdown Timer */}
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-3 w-3 text-red-500" />
                        <div className="text-center">
                          <p className="text-red-600 text-xs font-medium mb-1">
                            Ends in
                          </p>
                          <CountdownTimer
                            endDate={discount.endDate}
                            onExpired={() => {
                              console.log(`Discount ${discount.name} expired`);
                              // Optionally refresh discounts when one expires
                              loadActiveDiscounts();
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discount Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Products:</span>{" "}
                        {discount.productCount}
                      </div>
                      <div>
                        <span className="font-medium">Code:</span>{" "}
                        {discount.discountCode}
                      </div>
                      <div>
                        <span className="font-medium">Used:</span>{" "}
                        {discount.usedCount}/{discount.usageLimit}
                      </div>
                      <div>
                        <span className="font-medium">Remaining:</span>{" "}
                        {discount.remainingCount}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      {/* Colors and Sizes are now handled through Product Attributes above */}

      {/* Rating Filter */}
      {renderFilterSection(
        "Customer Rating",
        <div className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => {
                  updateFilters("rating", checked ? rating : null);
                }}
              />
              <label
                htmlFor={`rating-${rating}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer flex items-center gap-1"
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating
                          ? "fill-rating-star text-rating-star"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span>& up</span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Product Status Filters */}
      {renderFilterSection(
        "Product Status",
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock !== false}
              onCheckedChange={(checked) => updateFilters("inStock", checked)}
            />
            <label
              htmlFor="inStock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              In Stock Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBestseller"
              checked={filters.isBestseller || false}
              onCheckedChange={(checked) =>
                updateFilters("isBestseller", checked)
              }
            />
            <label
              htmlFor="isBestseller"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Bestseller
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              checked={filters.isFeatured || false}
              onCheckedChange={(checked) =>
                updateFilters("isFeatured", checked)
              }
            />
            <label
              htmlFor="isFeatured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Featured
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
