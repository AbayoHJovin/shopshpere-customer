"use client";

import React from "react";
import { BrandWithProducts } from "@/lib/landingPageService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BrandGridProps {
  brands: BrandWithProducts[];
}

const BrandGrid: React.FC<BrandGridProps> = ({ brands }) => {
  if (!brands || brands.length === 0) {
    return null;
  }

  // Limit to maximum 4 brands
  const displayBrands = brands.slice(0, 4);
  const brandCount = displayBrands.length;

  // Dynamic grid columns based on brand count
  const getGridClasses = () => {
    switch (brandCount) {
      case 1:
        return "grid-cols-1"; // 1 brand = full width
      case 2:
        return "grid-cols-1 lg:grid-cols-2"; // 2 brands = 2 columns on large screens
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"; // 3 brands = 3 columns on large screens
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"; // 4 brands = 4 columns on xl screens
    }
  };

  return (
    <div className="w-full">
      <div className={`grid ${getGridClasses()} gap-4 md:gap-6`}>
        {displayBrands.map((brand) => (
          <BrandCard 
            key={brand.id} 
            brand={brand}
            brandCount={brandCount}
          />
        ))}
      </div>
    </div>
  );
};

interface BrandCardProps {
  brand: BrandWithProducts;
  brandCount: number;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, brandCount }) => {
  // Show more products when fewer brands are displayed
  const maxProducts = brandCount === 1 ? 8 : brandCount === 2 ? 6 : 4;
  const displayProducts = brand.products.slice(0, maxProducts);

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 hover:border-gray-300">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 relative overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
            <Image
              src={brand.image}
              alt={brand.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
              {brand.name}
            </CardTitle>
            {brand.description && (
              <p className="text-sm text-gray-600 line-clamp-1">
                {brand.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Products Grid - Dynamic layout based on brand count */}
        <div className={`grid gap-3 mb-4 ${
          brandCount === 1 
            ? "grid-cols-4 sm:grid-cols-4 md:grid-cols-4" // 1 brand = 4 columns
            : brandCount === 2 
            ? "grid-cols-2 sm:grid-cols-3" // 2 brands = 2-3 columns
            : "grid-cols-2" // 3-4 brands = 2 columns
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
        <Link href={`/shop?brands=${encodeURIComponent(brand.slug || brand.name)}`}>
          <Button 
            variant="outline" 
            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <span className="text-sm">Shop {brand.name}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        {/* Product Count */}
        <p className="text-xs text-gray-500 text-center mt-2">
          {brand.productCount} products available
        </p>
      </CardContent>
    </Card>
  );
};

export default BrandGrid;
