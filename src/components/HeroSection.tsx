import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { heroBanner } from "@/assets";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing
                <span className="block text-accent">Products</span>
              </h1>
              <p className="text-xl text-white/90 max-w-lg">
                Shop from millions of products at unbeatable prices. Fast delivery, 
                secure payments, and hassle-free returns.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8"
              >
                Browse Categories
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-white/80">On orders $50+</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-white/80">100% Protected</p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Fast Delivery</p>
                <p className="text-xs text-white/80">Same day available</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img 
              src={heroBanner} 
              alt="Shopping Experience" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground p-4 rounded-xl shadow-lg">
              <p className="text-sm font-semibold">Special Offer</p>
              <p className="text-2xl font-bold">30% OFF</p>
              <p className="text-xs">Limited Time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 