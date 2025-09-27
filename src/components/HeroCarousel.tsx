"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, TrendingUp, Tag } from "lucide-react";
import { LandingPageData } from "@/lib/landingPageService";
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

interface HeroCarouselProps {
  landingData: LandingPageData;
}

const HeroCarousel = ({ landingData }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);

  // Helper function to generate consistent hash from string
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return hash;
  };

  useEffect(() => {
    const items: CarouselItem[] = [];

    // Add featured categories (limit to 4)
    const featuredCategories = landingData.featuredCategories || [];
    featuredCategories
      .filter((cat) => cat.productCount > 0)
      .slice(0, 4)
      .forEach((category) => {
        items.push({
          id: `category-${category.id}`,
          type: "category",
          title: category.name,
          subtitle: `${category.productCount} products`,
          image: category.image,
          productCount: category.productCount,
          link: `/shop?categories=${encodeURIComponent(category.slug || category.name)}`,
        });
      });

    // Add featured brands (limit to 3)
    const featuredBrands = landingData.featuredBrands || [];
    featuredBrands
      .filter((brand) => brand.productCount > 0)
      .slice(0, 3)
      .forEach((brand) => {
        items.push({
          id: `brand-${brand.id}`,
          type: "brand",
          title: brand.name,
          subtitle: `${brand.productCount} products`,
          image: brand.image,
          productCount: brand.productCount,
          isTopSelling: true,
          link: `/shop?brands=${encodeURIComponent(brand.slug || brand.name)}`,
        });
      });

    setCarouselItems(items);
  }, [landingData]);

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

  if (carouselItems.length === 0) {
    return (
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white h-96">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to ShopSphere</h1>
            <p className="text-xl text-white/90 mb-8">
              Discover amazing products and deals
            </p>
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold px-8 py-3 text-lg"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
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
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                {currentItem?.type === "brand" && currentItem.isTopSelling && (
                  <div className="flex items-center gap-1 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    Top Selling Brand
                  </div>
                )}
                {currentItem?.type === "discount" && currentItem.discount && (
                  <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Tag className="h-4 w-4" />
                    {currentItem.discount}% OFF
                  </div>
                )}
                {currentItem?.type === "category" && (
                  <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Star className="h-4 w-4" />
                    Popular Category
                  </div>
                )}
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                {currentItem?.title}
              </h1>

              <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
                {currentItem?.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={currentItem?.link || "/shop"}>
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold px-8 py-3 text-lg"
                >
                  Explore Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-blue-500 font-semibold px-8 py-3 text-lg"
                >
                  Shop All
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
