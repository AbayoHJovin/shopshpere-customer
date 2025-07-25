import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Check, Eye } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  discount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  discountedPrice?: number;
}

const ProductCard = ({ 
  id, 
  name, 
  price, 
  originalPrice, 
  rating, 
  reviewCount, 
  image, 
  discount,
  isNew,
  isBestseller,
  discountedPrice
}: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);
  
  // Check if product is in cart on component mount
  useEffect(() => {
    const cart = getCart();
    setIsInCart(cart.includes(id));
  }, [id]);
  
  // Toggle cart status
  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cart = getCart();
    
    if (isInCart) {
      // Remove from cart
      const newCart = cart.filter(itemId => itemId !== id);
      localStorage.setItem('cart', JSON.stringify(newCart));
      setIsInCart(false);
    } else {
      // Add to cart
      const newCart = [...cart, id];
      localStorage.setItem('cart', JSON.stringify(newCart));
      setIsInCart(true);
    }
  };
  
  // Get cart from localStorage
  const getCart = (): string[] => {
    try {
      const cartData = localStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error parsing cart data:', error);
      return [];
    }
  };

  return (
    <Card className="group relative overflow-hidden border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Image Container */}
        <Link href={`/product/${id}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount && (
                <Badge variant="destructive" className="text-xs">
                  -{discount}%
                </Badge>
              )}
              {isNew && (
                <Badge className="bg-success text-success-foreground text-xs">
                  New
                </Badge>
              )}
              {isBestseller && (
                <Badge className="bg-accent text-accent-foreground text-xs">
                  Bestseller
                </Badge>
              )}
            </div>

            {/* Buttons (appear on hover) */}
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex flex-col gap-2">
                <Button 
                  className={`w-full h-9 text-sm ${isInCart ? 'bg-success hover:bg-success/90' : ''}`}
                  onClick={handleCartToggle}
                >
                  {isInCart ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                <Link href={`/product/${id}`} className="w-full">
                  <Button variant="outline" className="w-full h-9 text-sm border-background/80 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-primary">
                    <Eye className="h-4 w-4 mr-2" />
                    View Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <Link href={`/product/${id}`} className="block p-4 space-y-2">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) 
                      ? "fill-rating-star text-rating-star" 
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-price">${discountedPrice || price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
          </div>
        </Link>
          
        {/* Mobile Buttons (visible on small screens where hover doesn't work well) */}
        <div className="sm:hidden p-4 pt-0 grid grid-cols-2 gap-2">
          <Button 
            className={`h-8 text-xs ${isInCart ? 'bg-success hover:bg-success/90' : ''}`}
            onClick={handleCartToggle}
          >
            {isInCart ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
          <Link href={`/product/${id}`} className="w-full">
            <Button variant="outline" className="w-full h-8 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 