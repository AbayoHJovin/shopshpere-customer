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
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { FilterService, FilterOptions, FilterError } from "@/lib/filterService";

interface ProductFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
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

  // Load filter options from backend
  useEffect(() => {
    loadFilterOptions();
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

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setFilterErrors([]);
    loadFilterOptions();
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

  // Discount ranges (these can remain static as they're calculation-based)
  const discountRanges = [
    { range: "1% - 20%", min: 1, max: 20, count: 56 },
    { range: "21% - 40%", min: 21, max: 40, count: 34 },
    { range: "41% - 60%", min: 41, max: 60, count: 12 },
    { range: "Over 60%", min: 61, max: 100, count: 8 },
  ];

  const updateFilters = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
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
      }, 300); // 300ms debounce
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
      discountRanges: [],
      gender: null,
      rating: null,
      inStock: false,
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.categories.length > 0 ||
    filters.brands?.length > 0 ||
    filters.discountRanges?.length > 0 ||
    (filters.attributes && Object.keys(filters.attributes).length > 0) ||
    filters.gender ||
    filters.rating !== null ||
    filters.inStock;

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
              {filters.discountRanges?.map((range: string) => (
                <Badge
                  key={`discount-${range}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {range}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() =>
                      updateFilters(
                        "discountRanges",
                        filters.discountRanges.filter(
                          (d: string) => d !== range
                        )
                      )
                    }
                  />
                </Badge>
              ))}
              {filters.gender && (
                <Badge key="gender" variant="secondary" className="text-xs">
                  {filters.gender === "MALE"
                    ? "Men"
                    : filters.gender === "FEMALE"
                    ? "Women"
                    : "Unisex"}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("gender", null)}
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
              {filters.inStock && (
                <Badge key="inStock" variant="secondary" className="text-xs">
                  In Stock
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters("inStock", false)}
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

      {/* Gender Filter */}
      {renderFilterSection(
        "Gender",
        <Select
          value={filters.gender || "all"}
          onValueChange={(value) =>
            updateFilters("gender", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="MALE">Men</SelectItem>
            <SelectItem value="FEMALE">Women</SelectItem>
            <SelectItem value="UNISEX">Unisex</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Discount Filter */}
      {renderFilterSection(
        "Discount",
        <div className="space-y-3">
          {discountRanges.map((discount) => (
            <div key={discount.range} className="flex items-center space-x-2">
              <Checkbox
                id={`discount-${discount.range}`}
                checked={filters.discountRanges?.includes(discount.range)}
                onCheckedChange={(checked) => {
                  const newDiscountRanges = checked
                    ? [...(filters.discountRanges || []), discount.range]
                    : (filters.discountRanges || []).filter(
                        (d: string) => d !== discount.range
                      );
                  updateFilters("discountRanges", newDiscountRanges);
                }}
              />
              <label
                htmlFor={`discount-${discount.range}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer flex items-center"
              >
                <PercentIcon className="h-3 w-3 mr-2 text-destructive" />
                {discount.range}
              </label>
              <span className="text-xs text-gray-500">({discount.count})</span>
            </div>
          ))}
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

      {/* In Stock Filter */}
      <div className="px-1">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilters("inStock", checked)}
          />
          <label
            htmlFor="inStock"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
