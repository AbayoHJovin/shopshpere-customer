"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Grid3X3, Package, Layers3, ChevronDown, ChevronRight } from "lucide-react";

// Mock data based on the Category model
const mockCategories = [
  {
    categoryId: "1",
    name: "Electronics",
    description: "Discover the latest in technology and innovation",
    productCount: 156,
    subcategories: [
      { 
        name: "Smartphones", 
        productCount: 45,
        description: "Latest smartphones with cutting-edge features",
        subcategories: [
          { name: "Android Phones", productCount: 25, description: "Wide range of Android devices" },
          { name: "iPhones", productCount: 20, description: "Apple's premium smartphone line" }
        ]
      },
      { 
        name: "Laptops", 
        productCount: 32,
        description: "Portable computers for work and play",
        subcategories: [
          { name: "Gaming Laptops", productCount: 15, description: "High-performance laptops for gaming enthusiasts" },
          { name: "Business Laptops", productCount: 17, description: "Reliable laptops for professional use" }
        ]
      },
      { name: "Headphones", productCount: 28, description: "Premium audio equipment for immersive sound" },
      { name: "Cameras", productCount: 19, description: "Capture life's moments with high-quality cameras" },
      { name: "Smart Watches", productCount: 32, description: "Wearable tech to track fitness and stay connected" }
    ]
  },
  {
    categoryId: "2",
    name: "Fashion",
    description: "Stay stylish with our curated fashion collection",
    productCount: 289,
    subcategories: [
      { name: "Men's Clothing", productCount: 89, description: "Stylish apparel for men of all ages" },
      { name: "Women's Clothing", productCount: 125, description: "Trendy clothing options for women" },
      { name: "Shoes", productCount: 67, description: "Footwear for all occasions", 
        subcategories: [
          { name: "Sneakers", productCount: 25, description: "Comfortable athletic and casual sneakers" },
          { name: "Formal Shoes", productCount: 20, description: "Elegant shoes for professional settings" },
          { name: "Boots", productCount: 22, description: "Sturdy and stylish boots for all seasons" }
        ]
      },
      { name: "Accessories", productCount: 8, description: "Complete your look with our accessory collection" }
    ]
  },
  {
    categoryId: "3",
    name: "Home & Garden",
    description: "Transform your living space with quality home essentials",
    productCount: 198,
    subcategories: [
      { name: "Furniture", productCount: 78, description: "Quality furniture for every room" },
      { name: "Kitchen & Dining", productCount: 45, description: "Essential kitchen tools and dining accessories" },
      { name: "Garden Tools", productCount: 32, description: "Equipment to maintain your outdoor space" },
      { name: "Home Decor", productCount: 43, description: "Add personality to your home with our decor items" }
    ]
  },
  {
    categoryId: "4",
    name: "Sports & Outdoors",
    description: "Gear up for your active lifestyle",
    productCount: 134,
    subcategories: [
      { name: "Fitness Equipment", productCount: 28, description: "Tools to help you reach your fitness goals" },
      { name: "Outdoor Gear", productCount: 41, description: "Equipment for outdoor adventures" },
      { name: "Sports Apparel", productCount: 65, description: "Performance wear for all sports" }
    ]
  },
  {
    categoryId: "5",
    name: "Books & Media",
    description: "Expand your knowledge and entertainment",
    productCount: 87,
    subcategories: [
      { name: "Fiction", productCount: 34, description: "Escape into captivating fictional worlds" },
      { name: "Non-Fiction", productCount: 28, description: "Learn something new with informative reads" },
      { name: "Educational", productCount: 25, description: "Resources for learning and development" }
    ]
  },
  {
    categoryId: "6",
    name: "Beauty & Personal Care",
    description: "Premium beauty and wellness products",
    productCount: 112,
    subcategories: [
      { name: "Skincare", productCount: 45, description: "Products to keep your skin healthy and radiant" },
      { name: "Makeup", productCount: 38, description: "Beauty products for every look and occasion" },
      { name: "Hair Care", productCount: 29, description: "Solutions for all hair types and concerns" }
    ]
  }
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const router = useRouter();

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle expanded state for a category or subcategory
  const toggleExpanded = (categoryPath: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryPath)) {
        return prev.filter(item => item !== categoryPath && !item.startsWith(`${categoryPath}/`));
      } else {
        return [...prev, categoryPath];
      }
    });
  };

  // Check if a category is expanded
  const isExpanded = (categoryPath: string) => {
    return expandedCategories.includes(categoryPath);
  };

  // Navigate to shop page with category filter
  const handleViewProducts = (categoryPath: string) => {
    const categoryName = categoryPath.split('/').pop() || '';
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  // Recursive function to render subcategories at any depth
  const renderSubcategory = (subcategory: any, index: number, categoryPath: string, level: number = 0) => {
    const fullPath = `${categoryPath}/${subcategory.name}`;
    const paddingLeft = level * 16; // 16px for each level
    const hasSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
    const expanded = isExpanded(fullPath);
    
    return (
      <div key={`${fullPath}-${index}`} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-2 rounded-md ${expanded ? 'bg-muted' : 'bg-muted/50'} hover:bg-muted transition-colors cursor-pointer`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => hasSubcategories ? toggleExpanded(fullPath) : handleViewProducts(fullPath)}
        >
          <div className="flex items-center gap-2">
            {hasSubcategories && (
              expanded ? 
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground">{subcategory.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {subcategory.productCount}
          </Badge>
        </div>
        
        {/* Show description when expanded */}
        {expanded && subcategory.description && (
          <div 
            className="text-xs text-muted-foreground p-2 bg-background/50 rounded-md"
            style={{ marginLeft: `${paddingLeft + 8}px` }}
          >
            {subcategory.description}
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs text-primary ml-2"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProducts(fullPath);
              }}
            >
              View products
            </Button>
          </div>
        )}
        
        {/* Render nested subcategories if they exist and category is expanded */}
        {hasSubcategories && expanded && (
          <div className="space-y-1 mt-1">
            {subcategory.subcategories.map((nestedSub: any, nestedIndex: number) => 
              renderSubcategory(nestedSub, nestedIndex, fullPath, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Grid3X3 className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                <Layers3 className="h-6 w-6 md:h-8 md:w-8 text-secondary absolute -top-2 -right-2" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Shop by <span className="text-primary">Categories</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8">
              Explore our diverse collection organized into convenient categories for easier shopping
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-10 md:h-12 text-base md:text-lg border-2 focus:border-primary"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {filteredCategories.map((category) => (
              <Card key={category.categoryId} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      <Package className="h-3 w-3 mr-1" />
                      {category.productCount}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Subcategories */}
                  <div className="mb-5 md:mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-2 md:mb-3">Subcategories:</h4>
                    <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                      {category.subcategories.map((sub, index) => 
                        renderSubcategory(sub, index, category.name, 0)
                      )}
                    </div>
                  </div>

                  {/* View Products Button */}
                  <Button 
                    onClick={() => handleViewProducts(category.name)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    variant="outline"
                  >
                    View All {category.name} Products
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <Grid3X3 className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No categories found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search term to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 