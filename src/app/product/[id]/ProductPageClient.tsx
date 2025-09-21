"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Check,
  ShoppingCart,
  Share2,
  Clock,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { ProductService, ProductDTO, ProductVariantDTO } from "@/lib/productService";
import { CartService, CartItemRequest } from "@/lib/cartService";
import { WishlistService, AddToWishlistRequest } from "@/lib/wishlistService";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/store/hooks";
import VariantSelectionModal from "@/components/VariantSelectionModal";
import SimilarProducts from "@/components/SimilarProducts";
import ReviewSection from "@/components/ReviewSection";

// Define a proper review interface
interface ProductReview {
  reviewId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  userProfilePicture?: string;
  username?: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
}

export function ProductPageClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [displayImages, setDisplayImages] = useState<any[]>([]);
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const [displayStock, setDisplayStock] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Helper functions for discount calculations
  const hasProductDiscount = (product: ProductDTO) => {
    return (
      product.discountedPrice && product.discountedPrice < product.basePrice
    );
  };

  const getEffectiveDiscount = (variant: any) => {
    if (!variant) return null;

    // If variant has its own discount, use that
    if (variant.hasActiveDiscount && variant.discount) {
      return {
        percentage: variant.discount.percentage,
        discountedPrice: variant.discountedPrice || variant.price,
        isVariantSpecific: true,
        discount: variant.discount,
      };
    }

    // If product has discount, apply it to variant
    if (product && hasProductDiscount(product)) {
      const discountPercentage =
        ((product.basePrice - product.discountedPrice!) / product.basePrice) *
        100;
      const variantDiscountedPrice =
        variant.price * (1 - discountPercentage / 100);
      return {
        percentage: discountPercentage,
        discountedPrice: variantDiscountedPrice,
        isVariantSpecific: false,
        discount: null,
      };
    }

    return null;
  };

  const formatPrice = (price: number, variant?: any) => {
    const basePrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

    if (variant) {
      const effectiveDiscount = getEffectiveDiscount(variant);
      if (effectiveDiscount) {
        const discountedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(effectiveDiscount.discountedPrice);

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-green-600">
              {discountedPrice}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {basePrice}
            </span>
          </div>
        );
      }
    }

    return <span className="font-semibold">{basePrice}</span>;
  };

  // Fetch product data on component mount
  useEffect(() => {
    fetchProductData();
  }, [productId]);

  // Check cart and wishlist status when product changes
  useEffect(() => {
    if (product) {
      checkCartStatus();
      checkWishlistStatus();
    }
  }, [product]);

  // Update display data when product or selected variant changes
  useEffect(() => {
    if (product) {
      if (
        selectedVariant &&
        selectedVariant.images &&
        selectedVariant.images.length > 0
      ) {
        // Use variant images if available
        setDisplayImages(selectedVariant.images);
        const effectiveDiscount = getEffectiveDiscount(selectedVariant);
        setDisplayPrice(
          effectiveDiscount
            ? effectiveDiscount.discountedPrice
            : selectedVariant.price || 0
        );
        // Calculate total stock from all warehouses for this variant
        setDisplayStock(ProductService.getVariantTotalStock(selectedVariant));
      } else {
        // Use product images and data
        setDisplayImages(product.images || []);
        setDisplayPrice(product.discountedPrice || product.basePrice || 0);
        setDisplayStock(product.totalWarehouseStock || product.stockQuantity || 0);
      }
      // Reset selected image when switching between product and variant images
      setSelectedImage(0);
    }
  }, [product, selectedVariant]);

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkCartStatus = async () => {
    if (!isAuthenticated || !product) return;

    try {
      const cart = await CartService.getCart();
      // Check if the product is in cart (either as base product or as a variant)
      const isProductInCart = cart.items.some(
        (item) => item.productId === product.productId
      );
      setIsInCart(isProductInCart);
    } catch (error) {
      console.error("Error checking cart status:", error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !product) return;

    try {
      // Check if the product is in wishlist
      const isProductInWishlist = await WishlistService.isInWishlist(
        product.productId
      );
      setIsInWishlist(isProductInWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsInWishlist(false);
    }
  };

  // Handle adding to cart
  const handleCartToggle = async () => {
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
        setIsCartLoading(true);
        const cart = await CartService.getCart();
        const cartItem = cart.items.find(
          (item) => item.productId === product!.productId
        );

        if (cartItem) {
          await CartService.removeItemFromCart(cartItem.id);
          setIsInCart(false);
          toast({
            title: "Removed from cart",
            description: `${product!.name} has been removed from your cart.`,
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
        setIsCartLoading(false);
      }
      return;
    }

    // Check if product has variants
    if (product && ProductService.hasVariants(product)) {
      // If variants exist, check if one is selected
      if (selectedVariant) {
        // Add selected variant to cart
        await handleAddToCart({
          productId: product.productId,
          variantId: selectedVariant.variantId,
          quantity,
        });
      } else {
        // Show variant selection modal if no variant is selected
        setShowVariantModal(true);
      }
    } else {
      // Add product directly to cart (no variants)
      await handleAddToCart({ productId: product!.productId, quantity });
    }
  };

  // Handle adding to cart (for both products and variants)
  const handleAddToCart = async (request: CartItemRequest) => {
    try {
      setIsCartLoading(true);
      await CartService.addItemToCart(request);
      setIsInCart(true);

      const itemName = request.variantId
        ? `${product!.name} (${selectedVariant?.variantSku})`
        : product!.name;

      toast({
        title: "Added to cart",
        description: `${itemName} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCartLoading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (isInWishlist) {
      // Remove from wishlist
      try {
        setIsWishlistLoading(true);
        toast({
          title: "Remove from wishlist",
          description: "Please go to your wishlist page to remove items.",
        });
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsWishlistLoading(false);
      }
      return;
    }

    // Add to wishlist
    setIsWishlistLoading(true);
    try {
      if (product) {
        await WishlistService.addToWishlist({
          productId: product.productId,
        });
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate the number of full stars for the rating display
  const fullStars = Math.floor(product.averageRating || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/50">
        <div className="container mx-auto px-4 py-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted">
              {displayImages && displayImages.length > 0 ? (
                <img
                  src={displayImages[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}

              {product.salePrice && product.salePrice < product.basePrice && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  SALE
                </Badge>
              )}
              {selectedVariant && displayImages !== product.images && (
                <Badge variant="secondary" className="absolute top-4 right-4">
                  Variant View
                </Badge>
              )}

              {/* Image navigation buttons */}
              {displayImages && displayImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? displayImages.length - 1 : prev - 1
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === displayImages.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages && displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((image, index) => (
                  <div
                    key={image.imageId}
                    className={`cursor-pointer rounded-md border overflow-hidden w-20 h-20 flex-shrink-0 ${
                      selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image.url}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Product Videos */}
            {product.videos && product.videos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Product Videos</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.videos.map((video, index) => (
                    <div
                      key={video.videoId}
                      className="relative aspect-video rounded-lg overflow-hidden border"
                    >
                      <video
                        src={video.url}
                        controls
                        className="w-full h-full object-cover"
                        poster={
                          displayImages && displayImages.length > 0
                            ? displayImages[0].url
                            : undefined
                        }
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                      {video.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                          {video.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Product categories as small badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categoryName && (
                  <Badge variant="outline" className="text-xs">
                    {product.categoryName}
                  </Badge>
                )}
                {product.brandName && (
                  <Badge variant="outline" className="text-xs">
                    {product.brandName}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < fullStars
                          ? "fill-rating-star text-rating-star"
                          : i < (product.averageRating || 0)
                          ? "text-rating-star fill-rating-star/50"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">
                  {(product.averageRating || 0).toFixed(1)} (
                  {product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-price">
                  ${displayPrice.toFixed(2)}
                </span>
                {selectedVariant ? (
                  // Show variant price with discount info
                  <>
                    {(() => {
                      const effectiveDiscount =
                        getEffectiveDiscount(selectedVariant);
                      if (effectiveDiscount) {
                        return (
                          <>
                            <span className="text-xl text-muted-foreground line-through">
                              ${selectedVariant.price.toFixed(2)}
                            </span>
                            <Badge
                              variant={
                                effectiveDiscount.isVariantSpecific
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={`ml-2 ${
                                effectiveDiscount.isVariantSpecific
                                  ? ""
                                  : "bg-orange-500 text-white"
                              }`}
                            >
                              -{Math.round(effectiveDiscount.percentage)}% OFF
                              {effectiveDiscount.isVariantSpecific
                                ? ""
                                : " (Product)"}
                            </Badge>
                          </>
                        );
                      }
                      return (
                        <span className="text-sm text-muted-foreground">
                          Variant Price
                        </span>
                      );
                    })()}
                  </>
                ) : (
                  // Show product price with discount info
                  <>
                    {product.salePrice &&
                      product.salePrice < product.basePrice &&
                      product.basePrice && (
                        <span className="text-xl text-muted-foreground line-through">
                          ${product.basePrice.toFixed(2)}
                        </span>
                      )}
                    {product.salePrice &&
                      product.salePrice < product.basePrice && (
                        <Badge variant="destructive" className="ml-2">
                          {Math.round(
                            ((product.basePrice - product.salePrice) /
                              product.basePrice) *
                              100
                          )}
                          % OFF
                        </Badge>
                      )}
                  </>
                )}
              </div>

              {/* Brief Description */}
              <p className="mt-4 text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <>
                {product.variants.every((v) => ProductService.getVariantTotalStock(v) === 0) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-800">
                      All variants are currently out of stock
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    Available Variants{" "}
                    {selectedVariant && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Selected: {selectedVariant.variantSku})
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((variant) => {
                      const effectiveDiscount = getEffectiveDiscount(variant);
                      return (
                        <div
                          key={variant.variantId}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedVariant?.variantId === variant.variantId
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "hover:border-primary/50"
                          } ${ProductService.getVariantTotalStock(variant) === 0 ? "opacity-50" : ""}`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          <div className="text-sm font-medium">
                            {variant.variantSku}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {effectiveDiscount ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-green-600">
                                  $
                                  {effectiveDiscount.discountedPrice.toFixed(2)}
                                </span>
                                <span className="line-through">
                                  ${(variant.price || 0).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              `$${(variant.price || 0).toFixed(2)}`
                            )}
                          </div>
                          {effectiveDiscount && (
                            <Badge
                              variant={
                                effectiveDiscount.isVariantSpecific
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={`text-xs mt-1 ${
                                effectiveDiscount.isVariantSpecific
                                  ? ""
                                  : "bg-orange-500 text-white"
                              }`}
                            >
                              -{Math.round(effectiveDiscount.percentage)}% OFF
                              {effectiveDiscount.isVariantSpecific
                                ? ""
                                : " (Product)"}
                            </Badge>
                          )}
                          <div
                            className={`text-xs ${
                              ProductService.getVariantTotalStock(variant) > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {ProductService.getVariantTotalStock(variant) > 0
                              ? `Stock: ${ProductService.getVariantTotalStock(variant)}`
                              : "Out of Stock"}
                          </div>
                          {/* Show variant attributes */}
                          {variant.attributes &&
                            variant.attributes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {variant.attributes.map((attr, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 px-1 py-0.5 rounded"
                                  >
                                    {attr.attributeType}: {attr.attributeValue}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                  {selectedVariant && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Selected: {selectedVariant.variantSku}
                      </div>
                      <div className="text-xs text-green-600">
                        {(() => {
                          const effectiveDiscount =
                            getEffectiveDiscount(selectedVariant);
                          if (effectiveDiscount) {
                            return (
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  Price: $
                                  {effectiveDiscount.discountedPrice.toFixed(2)}
                                </span>
                                <span className="line-through">
                                  Original: ${selectedVariant.price.toFixed(2)}
                                </span>
                                <span className="text-orange-600 font-medium">
                                  -{Math.round(effectiveDiscount.percentage)}%
                                  OFF
                                  {effectiveDiscount.isVariantSpecific
                                    ? ""
                                    : " (Product Discount)"}
                                </span>
                              </div>
                            );
                          }
                          return `Price: $${(
                            selectedVariant.price || 0
                          ).toFixed(2)}`;
                        })()}
                        <span className="ml-2">|</span>
                        <span className="ml-2">
                          Stock: {ProductService.getVariantTotalStock(selectedVariant)}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDisplayImages(
                              selectedVariant.images &&
                                selectedVariant.images.length > 0
                                ? selectedVariant.images
                                : product.images || []
                            );
                            const effectiveDiscount =
                              getEffectiveDiscount(selectedVariant);
                            setDisplayPrice(
                              effectiveDiscount
                                ? effectiveDiscount.discountedPrice
                                : selectedVariant.price || 0
                            );
                            setDisplayStock(ProductService.getVariantTotalStock(selectedVariant));
                          }}
                          className="text-xs"
                        >
                          View Variant Images
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDisplayImages(product.images || []);
                            setDisplayPrice(
                              product.discountedPrice || product.basePrice || 0
                            );
                            setDisplayStock(product.stockQuantity || 0);
                          }}
                          className="text-xs"
                        >
                          View Product Images
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Quantity */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center border rounded-md mt-1">
                  <button
                    className="px-3 py-2 hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    className="px-3 py-2 hover:bg-muted disabled:opacity-50"
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.min(displayStock || 999, prev + 1)
                      )
                    }
                    disabled={quantity >= (displayStock || 999)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Availability</label>
                <div className="flex items-center gap-1 mt-1">
                  <Badge
                    variant={
                      (displayStock || 0) > 0 ? "outline" : "destructive"
                    }
                    className="text-xs"
                  >
                    {(displayStock || 0) > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {(displayStock || 0) > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({displayStock} available)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                className={`flex-1 ${
                  isInCart ? "bg-success hover:bg-success/90" : ""
                }`}
                onClick={handleCartToggle}
                disabled={
                  (displayStock || 0) === 0 ||
                  isCartLoading ||
                  (ProductService.hasVariants(product) && !selectedVariant) ||
                  (selectedVariant && ProductService.getVariantTotalStock(selectedVariant) === 0)
                }
              >
                {isCartLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isInCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart
                  </>
                ) : selectedVariant && ProductService.getVariantTotalStock(selectedVariant) === 0 ? (
                  <>
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Out of Stock
                  </>
                ) : ProductService.hasVariants(product) && !selectedVariant ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Select Variant
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`hidden sm:flex ${
                  isInWishlist ? "text-red-500 border-red-500" : ""
                }`}
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
              >
                {isWishlistLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart
                    className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`}
                  />
                )}
              </Button>
              <Button variant="outline" size="icon" className="hidden sm:flex">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over $50
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">30 Day Returns</p>
                  <p className="text-xs text-muted-foreground">
                    Hassle-free returns
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">2 Year Warranty</p>
                  <p className="text-xs text-muted-foreground">Full coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="container mx-auto px-4 py-8 border-t">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-muted-foreground">
            <p>{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Details</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-muted-foreground">SKU</span>
                    <span>{product.sku}</span>
                  </div>
                  {product.dimensionsCm && (
                    <div className="grid grid-cols-2 gap-4 py-2 border-b">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span>{product.dimensionsCm}</span>
                    </div>
                  )}
                  {product.weightKg && (
                    <div className="grid grid-cols-2 gap-4 py-2 border-b">
                      <span className="text-muted-foreground">Weight</span>
                      <span>{product.weightKg} kg</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Information</h3>
                <p className="text-muted-foreground">
                  This product is part of the {product.categoryName} category
                  and manufactured by {product.brandName}.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <ReviewSection productId={productId} productName={product.name} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Products Section */}
      <section className="container mx-auto px-4 py-8 border-t">
        <SimilarProducts
          productId={product.productId}
          title="You Might Also Like"
          algorithm="mixed"
          maxProducts={8}
          showAlgorithmSelector={true}
        />
      </section>

      {/* Additional Similar Products Sections */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SimilarProducts
            productId={product.productId}
            title="People Also Bought"
            algorithm="popular"
            maxProducts={4}
            showAlgorithmSelector={false}
          />

          <SimilarProducts
            productId={product.productId}
            title="From Same Brand"
            algorithm="brand"
            maxProducts={4}
            showAlgorithmSelector={false}
          />
        </div>
      </section>

      {/* Variant Selection Modal */}
      {showVariantModal && product && (
        <VariantSelectionModal
          product={product}
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
