"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CategoryGrid from "@/components/CategoryGrid";
import BrandGrid from "@/components/BrandGrid";
import { landingPageService, LandingPageData } from "@/lib/landingPageService";
import { FilterService, CategoryDTO } from "@/lib/filterService";
import CountdownTimer from "@/components/CountdownTimer";
import ActiveDiscounts from "@/components/ActiveDiscounts";
import CategoryNav from "@/components/CategoryNav";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCardGrid from "@/components/ProductCardGrid";
import Header from "@/components/Header";

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
      hash = hash & hash;
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

        const [landingDataResult, categoriesResult] = await Promise.allSettled([
          landingPageService.fetchLandingPageData(),
          FilterService.fetchHierarchicalCategories(),
        ]);

        if (landingDataResult.status === "fulfilled") {
          setLandingData(landingDataResult.value);
          console.log("Landing page data:", landingDataResult.value);
        } else {
          console.log(
            "Error fetching the landing page data",
            landingDataResult
          );
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

  const handleSeeMore = (section: string, slug?: string) => {
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
      case "category":
        if (slug) {
          window.location.href = `/shop?categories=${slug}`;
        }
        break;
      case "brand":
        if (slug) {
          window.location.href = `/shop?brands=${slug}`;
        }
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!landingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">No data available</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryNav />
      <HeroCarousel landingData={landingData} />

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

        {/* Second Row - Discounted Products (Full Width) */}
        <div className="w-full">
          <ProductCardGrid
            products={landingData.discountedProducts}
            title="Discounted products"
            onSeeMore={() => handleSeeMore("discounted")}
            maxItems={8}
          />
        </div>

        {/* Featured Categories Grid */}
        {landingData.featuredCategories &&
          landingData.featuredCategories.length > 0 && (
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Shop by Category
                </h2>
                <p className="text-gray-600">
                  Discover products from our top categories
                </p>
              </div>
              <CategoryGrid categories={landingData.featuredCategories} />
            </div>
          )}

        {/* Featured Brands Grid */}
        {landingData.featuredBrands &&
          landingData.featuredBrands.length > 0 && (
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Shop by Brand
                </h2>
                <p className="text-gray-600">
                  Explore products from your favorite brands
                </p>
              </div>
              <BrandGrid brands={landingData.featuredBrands} />
            </div>
          )}
      </div>

      <Footer />
    </div>
  );
}
