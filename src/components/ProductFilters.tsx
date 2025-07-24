import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, X, ChevronDown, ChevronRight, RefreshCw, PercentIcon } from "lucide-react";
import { useState } from "react";

interface ProductFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

const ProductFilters = ({ filters, onFiltersChange }: ProductFiltersProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // Nested categories structure
  const categories = [
    {
      name: "Electronics",
      count: 234,
      subcategories: [
        { name: "Smartphones", count: 45, subcategories: [
          { name: "iPhone", count: 15 },
          { name: "Samsung", count: 20 },
          { name: "Other Android", count: 10 }
        ]},
        { name: "Laptops", count: 67, subcategories: [
          { name: "Gaming", count: 25 },
          { name: "Business", count: 22 },
          { name: "Ultrabooks", count: 20 }
        ]},
        { name: "Headphones", count: 34, subcategories: [
          { name: "Over-ear", count: 14 },
          { name: "In-ear", count: 12 },
          { name: "True Wireless", count: 8 }
        ]},
        { name: "Cameras", count: 28 }
      ]
    },
    {
      name: "Fashion",
      count: 567,
      subcategories: [
        { name: "Men's Clothing", count: 145 },
        { name: "Women's Clothing", count: 234 },
        { name: "Shoes", count: 123, subcategories: [
          { name: "Sneakers", count: 45 },
          { name: "Boots", count: 34 },
          { name: "Sandals", count: 44 }
        ]},
        { name: "Accessories", count: 65 }
      ]
    },
    {
      name: "Home & Garden",
      count: 123,
      subcategories: [
        { name: "Furniture", count: 45 },
        { name: "Kitchen", count: 34 },
        { name: "Garden Tools", count: 24 },
        { name: "Decor", count: 20 }
      ]
    },
    { name: "Sports", count: 89 },
    { name: "Books", count: 345 },
    { name: "Beauty", count: 156 }
  ];

  const colors = [
    { name: "Black", hex: "#000000", count: 145 },
    { name: "White", hex: "#FFFFFF", count: 123 },
    { name: "Red", hex: "#EF4444", count: 67 },
    { name: "Blue", hex: "#3B82F6", count: 89 },
    { name: "Green", hex: "#10B981", count: 45 },
    { name: "Yellow", hex: "#F59E0B", count: 34 },
    { name: "Pink", hex: "#EC4899", count: 56 },
    { name: "Purple", hex: "#8B5CF6", count: 23 },
    { name: "Gray", hex: "#6B7280", count: 78 },
    { name: "Brown", hex: "#92400E", count: 52 },
    { name: "Orange", hex: "#F97316", count: 31 },
    { name: "Teal", hex: "#14B8A6", count: 19 }
  ];

  const sizes = [
    { name: "XS", count: 34 },
    { name: "S", count: 67 },
    { name: "M", count: 89 },
    { name: "L", count: 76 },
    { name: "XL", count: 45 },
    { name: "XXL", count: 23 },
    { name: "8", count: 34 },
    { name: "9", count: 45 },
    { name: "10", count: 56 },
    { name: "11", count: 43 },
    { name: "12", count: 32 }
  ];

  // Discount ranges
  const discountRanges = [
    { range: "1% - 20%", min: 1, max: 20, count: 56 },
    { range: "21% - 40%", min: 21, max: 40, count: 34 },
    { range: "41% - 60%", min: 41, max: 60, count: 12 },
    { range: "Over 60%", min: 61, max: 100, count: 8 }
  ];

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      categories: [],
      colors: [],
      sizes: [],
      discountRanges: [],
      gender: null,
      rating: null,
      inStock: false
    });
  };

  const hasActiveFilters = 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 1000 || 
    filters.categories.length > 0 || 
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.discountRanges?.length > 0 ||
    filters.gender ||
    filters.rating !== null ||
    filters.inStock;

  const renderCategory = (category: any, level: number = 0) => {
    const isExpanded = expandedCategories.includes(category.name);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    
    return (
      <div key={category.name} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center space-x-2 py-1">
          {hasSubcategories && (
            <button
              onClick={() => toggleCategory(category.name)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
          {!hasSubcategories && <div className="w-5" />}
          <Checkbox
            id={category.name}
            checked={filters.categories.includes(category.name)}
            onCheckedChange={(checked) => {
              const newCategories = checked
                ? [...filters.categories, category.name]
                : filters.categories.filter((c: string) => c !== category.name);
              updateFilters('categories', newCategories);
            }}
          />
          <label
            htmlFor={category.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
          >
            {category.name}
          </label>
          <span className="text-xs text-muted-foreground">({category.count})</span>
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
        <CardHeader className="py-3 cursor-pointer" onClick={() => toggleSection(title)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{title}</CardTitle>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {!isCollapsed && <CardContent>{content}</CardContent>}
      </Card>
    );
  };

  return (
    <div className="h-[calc(100vh-150px)] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
      {/* Filter Controls */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
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
                <Badge key={`cat-${category}`} variant="secondary" className="text-xs">
                  {category}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters('categories', 
                      filters.categories.filter((c: string) => c !== category)
                    )}
                  />
                </Badge>
              ))}
              {filters.colors.map((color: string) => (
                <Badge key={`color-${color}`} variant="secondary" className="text-xs">
                  {color}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('colors',
                      filters.colors.filter((c: string) => c !== color)
                    )}
                  />
                </Badge>
              ))}
              {filters.sizes.map((size: string) => (
                <Badge key={`size-${size}`} variant="secondary" className="text-xs">
                  {size}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('sizes',
                      filters.sizes.filter((s: string) => s !== size)
                    )}
                  />
                </Badge>
              ))}
              {filters.discountRanges?.map((range: string) => (
                <Badge key={`discount-${range}`} variant="secondary" className="text-xs">
                  {range}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('discountRanges',
                      filters.discountRanges.filter((d: string) => d !== range)
                    )}
                  />
                </Badge>
              ))}
              {filters.gender && (
                <Badge key="gender" variant="secondary" className="text-xs">
                  {filters.gender === 'MALE' ? 'Men' : filters.gender === 'FEMALE' ? 'Women' : 'Unisex'}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('gender', null)}
                  />
                </Badge>
              )}
              {filters.rating && (
                <Badge key="rating" variant="secondary" className="text-xs">
                  {filters.rating}+ Stars
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('rating', null)}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge key="inStock" variant="secondary" className="text-xs">
                  In Stock
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('inStock', false)}
                  />
                </Badge>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <Badge key="price" variant="secondary" className="text-xs">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters('priceRange', [0, 1000])}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range Filter */}
      {renderFilterSection("Price Range", (
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilters('priceRange', value)}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}{filters.priceRange[1] === 1000 && '+'}</span>
          </div>
        </div>
      ))}

      {/* Categories Filter */}
      {renderFilterSection("Categories", (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map(category => renderCategory(category))}
        </div>
      ))}

      {/* Gender Filter */}
      {renderFilterSection("Gender", (
        <Select value={filters.gender || "all"} onValueChange={(value) => updateFilters('gender', value === "all" ? null : value)}>
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
      ))}

      {/* Discount Filter */}
      {renderFilterSection("Discount", (
        <div className="space-y-3">
          {discountRanges.map(discount => (
            <div key={discount.range} className="flex items-center space-x-2">
              <Checkbox
                id={`discount-${discount.range}`}
                checked={filters.discountRanges?.includes(discount.range)}
                onCheckedChange={(checked) => {
                  const newDiscountRanges = checked
                    ? [...(filters.discountRanges || []), discount.range]
                    : (filters.discountRanges || []).filter((d: string) => d !== discount.range);
                  updateFilters('discountRanges', newDiscountRanges);
                }}
              />
              <label
                htmlFor={`discount-${discount.range}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer flex items-center"
              >
                <PercentIcon className="h-3 w-3 mr-2 text-destructive" />
                {discount.range}
              </label>
              <span className="text-xs text-muted-foreground">({discount.count})</span>
            </div>
          ))}
        </div>
      ))}

      {/* Colors Filter */}
      {renderFilterSection("Colors", (
        <div className="grid grid-cols-4 gap-3">
          {colors.map(color => (
            <div key={color.name} className="flex flex-col items-center space-y-1">
              <div 
                className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                  filters.colors?.includes(color.name) 
                    ? "border-primary scale-110" 
                    : "border-muted-foreground/20 hover:border-muted-foreground/40"
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  const newColors = filters.colors?.includes(color.name)
                    ? (filters.colors || []).filter((c: string) => c !== color.name)
                    : [...(filters.colors || []), color.name];
                  updateFilters('colors', newColors);
                }}
              />
              <span className="text-xs text-center">{color.name}</span>
              <span className="text-xs text-muted-foreground">({color.count})</span>
            </div>
          ))}
        </div>
      ))}

      {/* Sizes Filter */}
      {renderFilterSection("Sizes", (
        <div className="grid grid-cols-3 gap-2">
          {sizes.map(size => (
            <div 
              key={size.name}
              className={`p-2 text-center border rounded cursor-pointer transition-all ${
                filters.sizes?.includes(size.name)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted hover:border-muted-foreground/40"
              }`}
              onClick={() => {
                const newSizes = filters.sizes?.includes(size.name)
                  ? (filters.sizes || []).filter((s: string) => s !== size.name)
                  : [...(filters.sizes || []), size.name];
                updateFilters('sizes', newSizes);
              }}
            >
              <div className="text-sm font-medium">{size.name}</div>
              <div className="text-xs text-muted-foreground">({size.count})</div>
            </div>
          ))}
        </div>
      ))}

      {/* Rating Filter */}
      {renderFilterSection("Customer Rating", (
        <div className="space-y-3">
          {[4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => {
                  updateFilters('rating', checked ? rating : null);
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
      ))}

      {/* In Stock Filter */}
      <div className="px-1">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilters('inStock', checked)}
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