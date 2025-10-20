"use client";

import React from "react";
import { CategoryWithProducts } from "@/lib/landingPageService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryGridProps {
  categories: CategoryWithProducts[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Limit to maximum 4 categories
  const displayCategories = categories.slice(0, 4);
  const categoryCount = displayCategories.length;

  // Dynamic grid columns based on category count
  const getGridClasses = () => {
    switch (categoryCount) {
      case 1:
        return "grid-cols-1"; // 1 category = full width
      case 2:
        return "grid-cols-1 lg:grid-cols-2"; // 2 categories = 2 columns on large screens
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"; // 3 categories = 3 columns on large screens
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"; // 4 categories = 4 columns on xl screens
    }
  };

  return (
    <div className="w-full">
      <div className={`grid ${getGridClasses()} gap-4 md:gap-6`}>
        {displayCategories.map((category) => (
          <CategoryCard 
            key={category.id} 
            category={category}
            categoryCount={categoryCount}
          />
        ))}
      </div>
    </div>
  );
};

interface CategoryCardProps {
  category: CategoryWithProducts;
  categoryCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, categoryCount }) => {
  // Show more products when fewer categories are displayed
  const maxProducts = categoryCount === 1 ? 8 : categoryCount === 2 ? 6 : 4;
  const displayProducts = category.products.slice(0, maxProducts);

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 hover:border-gray-300">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
          {category.name}
        </CardTitle>
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {category.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Products Grid - Dynamic layout based on category count */}
        <div className={`grid gap-3 mb-4 ${
          categoryCount === 1 
            ? "grid-cols-4 sm:grid-cols-4 md:grid-cols-4" // 1 category = 4 columns
            : categoryCount === 2 
            ? "grid-cols-2 sm:grid-cols-3" // 2 categories = 2-3 columns
            : "grid-cols-2" // 3-4 categories = 2 columns
        }`}>
          {displayProducts.map((product, index) => (
            <div key={product.id} className="group cursor-pointer">
              <Link href={`/product/${product.id}`}>
                <div className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  />
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-700 line-clamp-2 font-medium">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <span className="text-sm font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* See More Button */}
        <Link href={`/shop?categories=${encodeURIComponent(category.slug || category.name)}`}>
          <Button 
            variant="outline" 
            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <span className="text-sm">See all in {category.name}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        {/* Product Count */}
        <p className="text-xs text-gray-500 text-center mt-2">
          {category.productCount} products available
        </p>
      </CardContent>
    </Card>
  );
};

export default CategoryGrid;
