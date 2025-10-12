"use client";

import React, { useState, useEffect } from "react";
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
import {
  ProductService,
  ProductDTO,
  ProductVariantDTO,
} from "@/lib/productService";
import { CartService, CartItemRequest } from "@/lib/cartService";
import { WishlistService, AddToWishlistRequest } from "@/lib/wishlistService";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/store/hooks";
import { formatPrice as formatPriceUtil } from "@/lib/utils/priceFormatter";
import { triggerCartUpdate } from "@/lib/utils/cartUtils";
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
  const [variantsInCart, setVariantsInCart] = useState<Set<string>>(new Set());
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Image zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

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

  // Local price formatting function with discount display
  const formatPriceWithDiscount = (price: number, variant?: any) => {
    const basePrice = formatPriceUtil(price);

    if (variant) {
      const effectiveDiscount = getEffectiveDiscount(variant);
      if (effectiveDiscount) {
        const discountedPrice = formatPriceUtil(
          effectiveDiscount.discountedPrice
        );

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

  // Image zoom handlers
  const handleMouseEnter = () => {
    // Only enable zoom on desktop devices
    if (isDesktop) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming || !isDesktop) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate lens position (centered on cursor)
    const lensSize = 100; // Size of the lens
    const lensX = Math.max(
      0,
      Math.min(x - lensSize / 2, rect.width - lensSize)
    );
    const lensY = Math.max(
      0,
      Math.min(y - lensSize / 2, rect.height - lensSize)
    );

    // Calculate zoom position (for background positioning)
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;

    setLensPosition({ x: lensX, y: lensY });
    setZoomPosition({ x: zoomX, y: zoomY });
  };

  // Fetch product data on component mount
  useEffect(() => {
    fetchProductData();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      checkCartStatus();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [productId]);

  // Handle screen size detection for zoom feature
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    // Check initial screen size
    checkScreenSize();

    // Listen for window resize
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Check cart and wishlist status when product changes
  useEffect(() => {
    if (product) {
      checkCartStatus();
      checkWishlistStatus();
    }
  }, [product]);

  // Update cart status when selected variant changes
  useEffect(() => {
    if (product && selectedVariant) {
      checkCartStatus();
    }
  }, [selectedVariant]);

  // Reset zoom state when image changes
  useEffect(() => {
    setIsZooming(false);
  }, [selectedImage, displayImages]);

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
        setDisplayStock(
          product.totalWarehouseStock || product.stockQuantity || 0
        );
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
    if (!product) return;

    try {
      const cart = await CartService.getCart();

      // Get all cart items for this product
      const productCartItems = cart.items.filter(
        (item) => item.productId === product.productId
      );

      if (product && ProductService.hasVariants(product)) {
        // For products with variants, track which variants are in cart
        const variantIds = new Set(
          productCartItems
            .filter((item) => item.variantId)
            .map((item) => item.variantId!)
        );
        setVariantsInCart(variantIds);

        // Set isInCart based on selected variant
        if (selectedVariant) {
          setIsInCart(variantIds.has(selectedVariant.variantId.toString()));
        } else {
          setIsInCart(false);
        }
      } else {
        // For simple products, check if product itself is in cart
        const isProductInCart = productCartItems.some(
          (item) => !item.variantId
        );
        setIsInCart(isProductInCart);
        setVariantsInCart(new Set());
      }
    } catch (error) {
      console.error("Error checking cart status:", error);
      setIsInCart(false);
      setVariantsInCart(new Set());
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
    if (isInCart) {
      // Remove from cart
      try {
        setIsCartLoading(true);
        const cart = await CartService.getCart();

        let cartItem;
        if (product && ProductService.hasVariants(product) && selectedVariant) {
          // Find the specific variant in cart
          cartItem = cart.items.find(
            (item) =>
              item.productId === product!.productId &&
              item.variantId === selectedVariant.variantId.toString()
          );
        } else {
          // Find the product in cart (no variants)
          cartItem = cart.items.find(
            (item) => item.productId === product!.productId && !item.variantId
          );
        }

        if (cartItem) {
          await CartService.removeItemFromCart(cartItem.id);

          // Update local state
          if (
            product &&
            ProductService.hasVariants(product) &&
            selectedVariant
          ) {
            setVariantsInCart((prev) => {
              const newSet = new Set(prev);
              newSet.delete(selectedVariant.variantId.toString());
              return newSet;
            });
          }
          setIsInCart(false);

          // Trigger cart update for header
          triggerCartUpdate();

          const itemName = selectedVariant
            ? `${product!.name} (${selectedVariant.variantSku})`
            : product!.name;

          toast({
            title: "Removed from cart",
            description: `${itemName} has been removed from your cart.`,
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

      // Update local state
      if (request.variantId) {
        // Add variant to cart set
        setVariantsInCart((prev) =>
          new Set(prev).add(request.variantId!.toString())
        );
      }
      setIsInCart(true);

      // Trigger cart update for header
      triggerCartUpdate();

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
    if (isInWishlist) {
      // Remove from wishlist
      setIsWishlistLoading(true);
      try {
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

  // Show loading state while product is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Show error state if product failed to load
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p>Product not found or failed to load.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Product Images */}
          <div className="space-y-4">
            <div
              className="aspect-square relative rounded-lg overflow-hidden border bg-muted cursor-crosshair"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {displayImages && displayImages.length > 0 ? (
                <>
                  <img
                    src={displayImages[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Zoom Lens - only visible on desktop when zooming */}
                  {isZooming && isDesktop && (
                    <div
                      className="absolute border-2 border-white shadow-lg bg-white bg-opacity-30 pointer-events-none transition-opacity duration-200"
                      style={{
                        width: "100px",
                        height: "100px",
                        left: `${lensPosition.x}px`,
                        top: `${lensPosition.y}px`,
                        borderRadius: "4px",
                      }}
                    />
                  )}
                </>
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
                  {formatPriceUtil(displayPrice)}
                </span>
                {selectedVariant ? (
                  <>
                    {(() => {
                      const effectiveDiscount =
                        getEffectiveDiscount(selectedVariant);
                      if (effectiveDiscount) {
                        return (
                          <>
                            <span className="text-xl text-muted-foreground line-through">
                              {formatPriceUtil(selectedVariant.price)}
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
                          {formatPriceUtil(product.basePrice)}
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
                {product.variants.every(
                  (v) => ProductService.getVariantTotalStock(v) === 0
                ) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-800">
                      All variants are currently out of stock
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Variants */}
            {product && ProductService.hasVariants(product) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Available Variants</h3>
                  {variantsInCart.size > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {variantsInCart.size} in cart
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => {
                    const effectiveDiscount = getEffectiveDiscount(variant);
                    return (
                      <div
                        key={variant.variantId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVariant?.variantId === variant.variantId
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : variantsInCart.has(variant.variantId.toString())
                            ? "border-green-500 bg-green-50"
                            : "hover:border-primary/50"
                        } ${
                          ProductService.getVariantTotalStock(variant) === 0
                            ? "opacity-50"
                            : ""
                        }`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {variant.variantSku}
                          </div>
                          {variantsInCart.has(variant.variantId.toString()) && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-500 text-white"
                            >
                              In Cart
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {effectiveDiscount ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-green-600">
                                {formatPriceUtil(
                                  effectiveDiscount.discountedPrice
                                )}
                              </span>
                              <span className="line-through">
                                {formatPriceUtil(variant.price || 0)}
                              </span>
                            </div>
                          ) : (
                            formatPriceUtil(variant.price || 0)
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
                            ? `Stock: ${ProductService.getVariantTotalStock(
                                variant
                              )}`
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
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
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
                                Price:{" "}
                                {formatPriceUtil(
                                  effectiveDiscount.discountedPrice
                                )}
                              </span>
                              <span className="line-through">
                                Original:{" "}
                                {formatPriceUtil(selectedVariant.price)}
                              </span>
                              <span className="text-orange-600 font-medium">
                                -{Math.round(effectiveDiscount.percentage)}% OFF
                                {effectiveDiscount.isVariantSpecific
                                  ? ""
                                  : " (Product Discount)"}
                              </span>
                            </div>
                          );
                        }
                        return `Price: ${formatPriceUtil(
                          selectedVariant.price || 0
                        )}`;
                      })()}
                      <span className="ml-2">|</span>
                      <span className="ml-2">
                        Stock:{" "}
                        {ProductService.getVariantTotalStock(selectedVariant)}
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
                          setDisplayStock(
                            ProductService.getVariantTotalStock(selectedVariant)
                          );
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
                className={`flex-1 h-12 sm:h-10 ${
                  isInCart ? "bg-success hover:bg-success/90" : ""
                }`}
                onClick={handleCartToggle}
                disabled={
                  (displayStock || 0) === 0 ||
                  isCartLoading ||
                  (product &&
                    ProductService.hasVariants(product) &&
                    !selectedVariant) ||
                  (selectedVariant &&
                    ProductService.getVariantTotalStock(selectedVariant) === 0)
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
                    {selectedVariant
                      ? `Added: ${selectedVariant.variantSku}`
                      : "Added to Cart"}
                  </>
                ) : selectedVariant &&
                  ProductService.getVariantTotalStock(selectedVariant) === 0 ? (
                  <>
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Out of Stock
                  </>
                ) : product &&
                  ProductService.hasVariants(product) &&
                  !selectedVariant ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Select Variant
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {selectedVariant
                      ? `Add ${selectedVariant.variantSku}`
                      : "Add to Cart"}
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
          </div>

          {isZooming &&
            displayImages &&
            displayImages.length > 0 &&
            isDesktop && (
              <div
                className="absolute top-0 right-0 w-full h-full bg-white bg-opacity-95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-2xl z-50 pointer-events-none transition-all duration-300 ease-in-out"
                style={{
                  backgroundImage: `url(${displayImages[selectedImage]?.url})`,
                  backgroundSize: "250%", // 2.5x zoom level for better view
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-80 text-white p-3 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Zoom View Active
                      </span>
                    </div>
                    <div className="text-xs opacity-75">
                      Move cursor to explore • 2.5x magnification
                    </div>
                  </div>
                </div>

                {/* Zoom level indicator */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-full">
                  2.5× Zoom
                </div>

                {/* Crosshair indicator */}
                <div
                  className="absolute w-8 h-8 border-2 border-white rounded-full shadow-lg pointer-events-none"
                  style={{
                    left: `${zoomPosition.x}%`,
                    top: `${zoomPosition.y}%`,
                    transform: "translate(-50%, -50%)",
                    boxShadow:
                      "0 0 0 2px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.8)",
                  }}
                >
                  <div className="absolute inset-0 border border-black rounded-full opacity-30"></div>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="container mx-auto px-4 py-8 border-t">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 md:w-fit md:grid-cols-none md:flex md:gap-2">
            <TabsTrigger value="description" className="md:px-6">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="md:px-6">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="md:px-6">
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-muted-foreground">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line">
                {product.fullDescription || product.description}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Product Details</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 py-2 border-b">
                      <span className="text-muted-foreground">SKU</span>
                      <span>{product.sku}</span>
                    </div>
                    {product.dimensionsCm && (
                      <div className="grid grid-cols-2 gap-4 py-2 border-b">
                        <span className="text-muted-foreground">
                          Dimensions
                        </span>
                        <span>{product.dimensionsCm}</span>
                      </div>
                    )}
                    {product.weightKg && (
                      <div className="grid grid-cols-2 gap-4 py-2 border-b">
                        <span className="text-muted-foreground">Weight</span>
                        <span>{product.weightKg} kg</span>
                      </div>
                    )}
                    {product.material && (
                      <div className="grid grid-cols-2 gap-4 py-2 border-b">
                        <span className="text-muted-foreground">Material</span>
                        <span>{product.material}</span>
                      </div>
                    )}
                  </div>
                </div>

                {product.careInstructions && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Care Instructions</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {product.careInstructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {product.warrantyInfo && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Warranty Information
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {product.warrantyInfo}
                      </p>
                    </div>
                  </div>
                )}

                {product.shippingInfo && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Shipping Information
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {product.shippingInfo}
                      </p>
                    </div>
                  </div>
                )}

                {product.returnPolicy && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Return Policy
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {product.returnPolicy}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Product Information</h3>
                  <p className="text-muted-foreground">
                    This product is part of the {product.categoryName} category
                    and manufactured by {product.brandName}.
                  </p>
                </div>
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
          {product && (
            <>
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
            </>
          )}
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
