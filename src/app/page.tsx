"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import DiscountTimer from "@/components/DiscountTimer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Flame, Sparkles, Gift, Zap, ArrowRight, Monitor, Smartphone, Headphones, Laptop, Camera, Watch, Tv, Speaker } from "lucide-react";

// Import product images from assets
import {
  headphones,
  smartphone,
  laptop,
  sneakers,
  watch,
  coffeeMaker,
  backpack
} from "@/assets";

const allProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones with Noise Cancellation",
    price: 199,
    originalPrice: 249,
    rating: 4.5,
    reviewCount: 1234,
    image: headphones,
    discount: 20,
    isBestseller: true
  },
  {
    id: "2",
    name: "Latest Smartphone with Pro Camera System",
    price: 899,
    originalPrice: 999,
    rating: 4.8,
    reviewCount: 567,
    image: smartphone,
    discount: 10,
    isNew: true
  },
  {
    id: "3",
    name: "High-Performance Laptop for Professionals",
    price: 1299,
    rating: 4.6,
    reviewCount: 234,
    image: laptop,
    isBestseller: true
  },
  {
    id: "4",
    name: "Comfortable Running Sneakers",
    price: 129,
    originalPrice: 159,
    rating: 4.3,
    reviewCount: 789,
    image: sneakers,
    discount: 19
  },
  {
    id: "5",
    name: "Elegant Smartwatch with Health Tracking",
    price: 349,
    rating: 4.4,
    reviewCount: 456,
    image: watch,
    isNew: true
  },
  {
    id: "6",
    name: "Professional Coffee Maker Machine",
    price: 229,
    originalPrice: 279,
    rating: 4.7,
    reviewCount: 123,
    image: coffeeMaker,
    discount: 18
  },
  {
    id: "7",
    name: "Designer Travel Backpack with Laptop Compartment",
    price: 89,
    rating: 4.2,
    reviewCount: 345,
    image: backpack
  },
  {
    id: "8",
    name: "Premium Wireless Headphones Pro",
    price: 299,
    originalPrice: 349,
    rating: 4.9,
    reviewCount: 890,
    image: headphones,
    discount: 14,
    isBestseller: true
  }
];

export default function Home() {
  // Create discount end time (24 hours from now)
  const discountEndTime = new Date();
  discountEndTime.setHours(discountEndTime.getHours() + 24);
  
  // Filter products by categories
  const trendingProducts = allProducts.filter(p => p.isBestseller).slice(0, 5);
  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 5);
  const discountedProducts = allProducts.filter(p => p.discount).slice(0, 5);
  const electronicsProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes('headphones') || 
    p.name.toLowerCase().includes('smartphone') || 
    p.name.toLowerCase().includes('laptop') ||
    p.name.toLowerCase().includes('watch')
  ).slice(0, 5);

  // Electronics categories with icons and counts
  const electronicCategories = [
    { name: "Smartphones", icon: <Smartphone className="h-8 w-8" />, count: 45, color: "from-blue-500 to-cyan-400" },
    { name: "Laptops", icon: <Laptop className="h-8 w-8" />, count: 67, color: "from-violet-500 to-purple-400" },
    { name: "Headphones", icon: <Headphones className="h-8 w-8" />, count: 34, color: "from-amber-500 to-orange-400" },
    { name: "Cameras", icon: <Camera className="h-8 w-8" />, count: 28, color: "from-green-500 to-emerald-400" },
    { name: "Wearables", icon: <Watch className="h-8 w-8" />, count: 52, color: "from-rose-500 to-pink-400" },
    { name: "TVs", icon: <Tv className="h-8 w-8" />, count: 41, color: "from-slate-500 to-gray-400" },
    { name: "Audio", icon: <Speaker className="h-8 w-8" />, count: 37, color: "from-red-500 to-orange-400" },
    { name: "Accessories", icon: <Monitor className="h-8 w-8" />, count: 93, color: "from-teal-500 to-cyan-400" }
  ];
  
  // Show limited categories initially, and expand when "Load More" is clicked
  const [showAllCategories, setShowAllCategories] = useState(false);
  const displayedCategories = showAllCategories ? electronicCategories : electronicCategories.slice(0, 4);

  const handleLoadMore = (section: string) => {
    if (section === 'categories') {
      setShowAllCategories(true);
    } else {
      console.log(`Loading more ${section} products...`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CategoryNav />
      <HeroSection />
      
      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Trending Products */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-3xl -z-10"></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="h-6 w-6 text-destructive" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
                Trending Now
              </h2>
            </div>
            <ProductSection
              title=""
              products={trendingProducts}
              onLoadMore={() => handleLoadMore('trending')}
            />
          </div>
        </div>

        {/* Flash Sale with Timer */}
        <div className="relative bg-gradient-to-r from-destructive/10 via-destructive/5 to-accent/10 rounded-3xl p-8">
          <div className="absolute top-4 right-4">
            <DiscountTimer endTime={discountEndTime} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-destructive animate-pulse" />
            <h2 className="text-3xl font-bold text-destructive">Flash Sale</h2>
            <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              Limited Time!
            </div>
          </div>
          <ProductSection
            title=""
            products={discountedProducts}
            onLoadMore={() => handleLoadMore('deals')}
          />
        </div>

        {/* New Arrivals */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-l from-accent/5 to-transparent rounded-3xl -z-10"></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Fresh Arrivals
              </h2>
              <div className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                Just In
              </div>
            </div>
            <ProductSection
              title=""
              products={newArrivals}
              onLoadMore={() => handleLoadMore('new arrivals')}
            />
          </div>
        </div>

        {/* Electronics Category */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent rounded-3xl -z-10"></div>
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <Gift className="h-6 w-6 text-secondary" />
                <h2 className="text-3xl font-bold text-secondary">Categories</h2>
              </div>
              <Link href="/categories" passHref>
                <Button variant="link" className="text-secondary font-medium pl-0 sm:pl-4">
                  View All Categories
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Categories Grid */}
            <div className="mb-8">
              <p className="text-lg text-muted-foreground mb-6">Browse by categories</p>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {displayedCategories.map((category, index) => (
                  <Link 
                    href={`/shop?categories=${encodeURIComponent(category.name)}`}
                    key={category.name}
                    className="block"
                  >
                    <div 
                      className="group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="relative p-6 flex flex-col items-center justify-center h-full text-white">
                        <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-lg text-center">{category.name}</h3>
                        <p className="text-sm text-white/80">{category.count} products</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {!showAllCategories && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => handleLoadMore('categories')}
                    className="border-secondary text-secondary hover:bg-secondary/10"
                  >
                    Load More Categories
                  </Button>
                </div>
              )}
            </div>
            
            {/* Featured Electronics Products */}
            <div className="mt-10">
              <h3 className="text-xl font-medium mb-6">Featured Products</h3>
              <ProductSection
                title=""
                products={electronicsProducts}
                onLoadMore={() => handleLoadMore('electronics')}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
