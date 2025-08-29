import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Check, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import VariantSelectionModal from "./VariantSelectionModal";
import { ProductService, ProductDTO } from "@/lib/productService";
import { CartService, CartItemRequest } from "@/lib/cartService";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/store/hooks";

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
  discountedPrice,
}: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDTO | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Check if product is in cart on component mount
  useEffect(() => {
    checkCartStatus();
  }, [id]);

  const checkCartStatus = async () => {
    try {
      const cart = await CartService.getCart();
      const isProductInCart = cart.items.some((item) => item.productId === id);
      setIsInCart(isProductInCart);
    } catch (error) {
      console.error("Error checking cart status:", error);
    }
  };

  // Check if product has variants and handle cart action
  const handleCartToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (isInCart) {
      // Remove from cart
      try {
        setIsLoading(true);
        const cart = await CartService.getCart();
        const cartItem = cart.items.find((item) => item.productId === id);

        if (cartItem) {
          await CartService.removeItemFromCart(cartItem.id);
          setIsInCart(false);
          toast({
            title: "Removed from cart",
            description: `${name} has been removed from your cart.`,
          });
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from cart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Check if product has variants
    setIsLoading(true);
    try {
      const product = await ProductService.getProductById(id);
      setProductDetails(product);

      if (ProductService.hasVariants(product)) {
        // Show variant selection modal
        setShowVariantModal(true);
      } else {
        // Add product directly to cart
        await handleAddToCart({ productId: id, quantity: 1 });
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding to cart (for both products and variants)
  const handleAddToCart = async (request: CartItemRequest) => {
    try {
      setIsLoading(true);
      await CartService.addItemToCart(request);
      setIsInCart(true);

      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  className={`w-full h-9 text-sm ${
                    isInCart ? "bg-success hover:bg-success/90" : ""
                  }`}
                  onClick={handleCartToggle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : isInCart ? (
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
                  <Button
                    variant="outline"
                    className="w-full h-9 text-sm border-background/80 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link href={`/product/${id}`}>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              ${discountedPrice ? discountedPrice.toFixed(2) : price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Variant Selection Modal */}
      {showVariantModal && productDetails && (
        <VariantSelectionModal
          product={productDetails}
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </Card>
  );
};

export default ProductCard;
