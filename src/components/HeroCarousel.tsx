"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, TrendingUp, Tag } from "lucide-react";
import { FilterService, CategoryDTO, BrandDTO } from "@/lib/filterService";
import Link from "next/link";

interface CarouselItem {
  id: string;
  type: "category" | "brand" | "discount";
  title: string;
  subtitle?: string;
  image: string;
  discount?: number;
  productCount?: number;
  isTopSelling?: boolean;
  link: string;
}

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const [categoriesResult, brandsResult] = await Promise.allSettled([
          FilterService.fetchHierarchicalCategories(),
          FilterService.fetchActiveBrands(),
        ]);

        const items: CarouselItem[] = [];

        // Add categories
        if (categoriesResult.status === "fulfilled") {
          const categories = categoriesResult.value.slice(0, 6);
          categories.forEach((category: CategoryDTO) => {
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

            items.push({
              id: `category-${category.categoryId}`,
              type: "category",
              title: category.name,
              subtitle: `${category.productCount || 0} products`,
              image: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="${backgroundColor}"/>
                  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" dy=".3em" fill="white">${category.name}</text>
                </svg>
              `)}`,
              productCount: category.productCount,
              link: `/shop?categories=${encodeURIComponent(category.name)}`,
            });
          });
        }

        // Add brands
        if (brandsResult.status === "fulfilled") {
          const brands = brandsResult.value.slice(0, 4);
          brands.forEach((brand: BrandDTO) => {
            items.push({
              id: `brand-${brand.brandId}`,
              type: "brand",
              title: brand.brandName,
              subtitle: "Top Brand",
              image: `https://images.unsplash.com/photo-${
                1600000000000 + parseInt(brand.brandId.slice(-3))
              }?w=800&h=600&fit=crop`,
              isTopSelling: true,
              link: `/shop?brands=${encodeURIComponent(brand.brandName)}`,
            });
          });
        }

        setCarouselItems(items);
      } catch (error) {
        console.error("Error fetching carousel data:", error);
        setCarouselItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (carouselItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [carouselItems.length]);

  const goToPrevious = () => {
    setCurrentIndex(
      currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1
    );
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white h-96">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </section>
    );
  }

  const currentItem = carouselItems[currentIndex];

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white h-96 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentItem?.image})`,
          filter: "brightness(0.4)",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/60" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {currentItem?.type === "brand" && currentItem.isTopSelling && (
                  <div className="flex items-center gap-1 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                    <TrendingUp className="h-3 w-3" />
                    Top Selling
                  </div>
                )}
                {currentItem?.type === "discount" && currentItem.discount && (
                  <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    <Tag className="h-3 w-3" />
                    {currentItem.discount}% OFF
                  </div>
                )}
                {currentItem?.type === "category" && (
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    <Star className="h-3 w-3" />
                    Category
                  </div>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {currentItem?.title}
              </h1>

              <p className="text-xl text-white/90 max-w-lg">
                {currentItem?.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={currentItem?.link || "/shop"}>
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold px-8"
                >
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Product Grid Preview */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {carouselItems.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                    index === currentIndex
                      ? "ring-2 ring-yellow-400 scale-105"
                      : "opacity-70"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-sm font-medium text-center px-2">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex ? "bg-yellow-400" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
