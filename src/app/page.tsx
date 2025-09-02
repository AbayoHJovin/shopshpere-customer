"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCardGrid from "@/components/ProductCardGrid";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Sparkles,
  Tag,
  Star,
  ShoppingBag,
  Music,
  Shirt,
  Home as HomeIcon,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { landingPageService, LandingPageData } from "@/lib/landingPageService";
import { FilterService } from "@/lib/filterService";
import CountdownTimer from "@/components/CountdownTimer";

export default function Home() {
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Helper function to generate consistent hash from string
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  // Helper function to check if string is a valid URL
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch landing page data and categories in parallel
        const [landingDataResult, categoriesResult] = await Promise.allSettled([
          landingPageService.fetchLandingPageData(),
          FilterService.fetchHierarchicalCategories(),
        ]);

        if (landingDataResult.status === "fulfilled") {
          setLandingData(landingDataResult.value);
        } else {
          throw new Error("Failed to fetch landing page data");
        }

        if (categoriesResult.status === "fulfilled") {
          setCategories(categoriesResult.value);
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
        setError("Failed to load landing page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSeeMore = (section: string) => {
    switch (section) {
      case "top-selling":
        window.location.href = "/shop?sortBy=rating&sortDir=desc";
        break;
      case "new-products":
        window.location.href = "/shop?sortBy=createdAt&sortDir=desc";
        break;
      case "discounted":
        window.location.href = "/shop?discountRanges=10-50";
        break;
      case "categories":
        window.location.href = "/categories";
        break;
      case "brands":
        window.location.href = "/shop?sortBy=brandName";
        break;
      default:
        window.location.href = "/shop";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !landingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Unable to load the homepage content."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryNav />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Top Row - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductCardGrid
            products={landingData.topSellingProducts}
            title="Top-selling products"
            onSeeMore={() => handleSeeMore("top-selling")}
            maxItems={4}
          />

          <ProductCardGrid
            products={landingData.newProducts}
            title="New products"
            onSeeMore={() => handleSeeMore("new-products")}
            maxItems={4}
          />
        </div>

        {/* Second Row - Discounted Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductCardGrid
            products={landingData.discountedProducts}
            title="Discounted products"
            onSeeMore={() => handleSeeMore("discounted")}
            maxItems={4}
          />
        </div>

        {/* Third Row - Popular Categories and Brands side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Categories - takes 2 columns on large screens */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Popular categories
              </h2>
              <Button
                variant="link"
                onClick={() => handleSeeMore("categories")}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                See more
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {landingData.popularCategories.slice(0, 6).map((category) => {
                const colors = [
                  "#FF6B6B",
                  "#4ECDC4",
                  "#45B7D1",
                  "#96CEB4",
                  "#FFEAA7",
                  "#DDA0DD",
                  "#98D8C8",
                  "#F7DC6F",
                ];
                const colorIndex =
                  Math.abs(hashCode(category.name)) % colors.length;
                const backgroundColor = colors[colorIndex];

                return (
                  <Link
                    key={category.id}
                    href={`/shop?categories=${encodeURIComponent(
                      category.name
                    )}`}
                    className="group"
                  >
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square mb-2">
                      {category.image && isValidUrl(category.image) ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div
                          className="w-full h-full group-hover:scale-105 transition-transform duration-200"
                          style={{ backgroundColor }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-medium text-sm truncate">
                          {category.name}
                        </h3>
                        <p className="text-white/80 text-xs">
                          {category.productCount} products
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Popular Brands - takes 1 column on large screens */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Popular brands
              </h2>
              <Button
                variant="link"
                onClick={() => handleSeeMore("brands")}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                See more
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {landingData.popularBrands.slice(0, 6).map((brand) => {
                const colors = [
                  "#FF6B6B",
                  "#4ECDC4",
                  "#45B7D1",
                  "#96CEB4",
                  "#FFEAA7",
                  "#DDA0DD",
                  "#98D8C8",
                  "#F7DC6F",
                ];
                const colorIndex =
                  Math.abs(hashCode(brand.name)) % colors.length;
                const backgroundColor = colors[colorIndex];

                return (
                  <Link
                    key={brand.id}
                    href={`/shop?brands=${encodeURIComponent(brand.name)}`}
                    className="group"
                  >
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square mb-2">
                      {brand.image && isValidUrl(brand.image) ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div
                          className="w-full h-full group-hover:scale-105 transition-transform duration-200"
                          style={{ backgroundColor }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-medium text-sm truncate">
                          {brand.name}
                        </h3>
                        <p className="text-white/80 text-xs">
                          {brand.productCount} products
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fourth Row - Active Discounts and Shop by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Discounts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Active discounts
              </h2>
              <Button
                variant="link"
                onClick={() => handleSeeMore("discounted")}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                See more
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {landingData.discountedProducts
                .filter(
                  (product) =>
                    product.hasActiveDiscount && product.discountEndDate
                )
                .slice(0, 8)
                .map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group"
                  >
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square mb-1">
                      {product.image &&
                      product.image !==
                        "https://via.placeholder.com/400x400" ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                          <span className="text-xs font-medium">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                      <div className="absolute top-1 left-1">
                        <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-bold">
                          {product.discount}% OFF
                        </span>
                      </div>
                      <div className="absolute bottom-1 left-1 right-1">
                        <h3 className="text-white font-medium text-xs truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-white/80 text-[10px]">
                            {product.brand} • {product.category}
                          </p>
                          {product.discountEndDate && (
                            <CountdownTimer
                              endDate={product.discountEndDate}
                              onExpired={() => {
                                console.log(
                                  `Discount expired for ${product.name}`
                                );
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

              {landingData.discountedProducts.filter(
                (product) =>
                  product.hasActiveDiscount && product.discountEndDate
              ).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p className="text-sm">No active discounts at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Shop by category
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {categories.slice(0, 6).map((category) => {
                const colors = [
                  "bg-pink-500",
                  "bg-purple-500",
                  "bg-green-500",
                  "bg-blue-500",
                  "bg-orange-500",
                  "bg-gray-500",
                ];
                const colorIndex =
                  Math.abs(hashCode(category.name)) % colors.length;
                const backgroundColor = colors[colorIndex];

                return (
                  <Link
                    key={category.categoryId}
                    href={`/shop?categories=${encodeURIComponent(
                      category.name
                    )}`}
                    className="group"
                  >
                    <div
                      className={`${backgroundColor} rounded-lg p-4 text-white group-hover:opacity-90 transition-opacity duration-200 relative overflow-hidden`}
                    >
                      {category.imageUrl && isValidUrl(category.imageUrl) ? (
                        <div className="absolute inset-0">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                        </div>
                      ) : null}
                      <div className="relative flex items-center gap-3">
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
