"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Zap, 
  CalendarDays, 
  Bookmark,
  ArrowRight, 
  Tag, 
  TagsIcon, 
  CheckCircle
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getActiveDiscounts, getUpcomingDiscounts, Discount } from "@/data/discounts";

export default function Discounts() {
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const [upcomingDiscounts, setUpcomingDiscounts] = useState<Discount[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  
  useEffect(() => {
    // Fetch discounts
    setActiveDiscounts(getActiveDiscounts());
    setUpcomingDiscounts(getUpcomingDiscounts());
  }, []);

  // Format a date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate remaining time until end date
  const getRemainingTime = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    // If already expired
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    }
  };

  // Render a single discount card
  const renderDiscountCard = (discount: Discount, isAnimated: boolean = true) => {
    const containerClasses = `relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${isAnimated ? 'hover:-translate-y-1' : ''}`;
    
    const discountCard = (
      <div key={discount.id} className={containerClasses}>
        {/* Banner with gradient overlay */}
        <div className="relative h-48">
          <div className={`absolute inset-0 bg-gradient-to-r ${discount.bannerColor} opacity-80`}></div>
          <img 
            src={discount.bannerImage} 
            alt={discount.title}
            className="w-full h-full object-cover" 
          />
          
          {/* Discount percentage badge */}
          <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
            <span className="text-xl font-bold text-primary">
              {discount.discountPercentage}% OFF
            </span>
          </div>
          
          {/* Flash sale badge */}
          {discount.isFlashSale && (
            <Badge 
              className="absolute top-4 left-4 bg-destructive text-destructive-foreground animate-pulse"
            >
              <Zap className="h-3 w-3 mr-1" />
              Flash Sale
            </Badge>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5 bg-card">
          <h3 className="text-xl font-bold mb-2">{discount.title}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-2">{discount.description}</p>
          
          {/* Details */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getRemainingTime(discount.endDate)}
            </Badge>
            
            {discount.code && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-primary/10 text-primary border-primary hover:bg-primary/20 flex items-center gap-1 cursor-pointer">
                      <Tag className="h-3 w-3" />
                      {discount.code}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {discount.categories && discount.categories.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TagsIcon className="h-3 w-3" />
                      {discount.categories.length} {discount.categories.length === 1 ? 'category' : 'categories'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{discount.categories.join(', ')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>From: {formatDate(discount.startDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>To: {formatDate(discount.endDate)}</span>
            </div>
          </div>
          
          {/* Action button */}
          <Link href={`/discounts/${discount.id}`} className="block">
            <Button className="w-full">
              View Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
    
    if (isAnimated) {
      return (
        <motion.div
          key={discount.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {discountCard}
        </motion.div>
      );
    }
    
    return discountCard;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Save More Today
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Exclusive Discounts & Offers</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Discover our latest promotions, flash sales, and special offers to save on your favorite products.
            </p>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-[50px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              className="fill-background"
            ></path>
          </svg>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="active" className="relative">
                Active Discounts
                {activeDiscounts.length > 0 && (
                  <Badge className="ml-2 bg-primary">{activeDiscounts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming Offers
                {upcomingDiscounts.length > 0 && (
                  <Badge className="ml-2 bg-muted">{upcomingDiscounts.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Flash Sale Banner */}
            {activeTab === "active" && activeDiscounts.some(d => d.isFlashSale) && (
              <div className="hidden md:flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1 rounded-full">
                <Zap className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Flash Sales Active!</span>
              </div>
            )}
          </div>
          
          <TabsContent value="active" className="mt-0">
            {activeDiscounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDiscounts.map((discount) => renderDiscountCard(discount))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Discounts</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    There are no active discounts at the moment. Check back later or browse our upcoming offers.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0">
            {upcomingDiscounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingDiscounts.map((discount) => renderDiscountCard(discount, false))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Discounts</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    There are no upcoming discounts scheduled at the moment. Check out our active discounts instead.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Newsletter Section */}
        <div className="mt-16 bg-muted/30 border rounded-xl p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-3">Never Miss a Deal</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter to get notified about new discounts, flash sales, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 