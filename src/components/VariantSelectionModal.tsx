import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Package,
  DollarSign,
  Star,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ProductDTO, ProductVariantDTO, ProductService } from "@/lib/productService";
import { CartItemRequest, CartService } from "@/lib/cartService";
import { formatPrice as formatPriceUtil, formatDiscountedPrice } from "@/lib/utils/priceFormatter";
import { triggerCartUpdate } from "@/lib/utils/cartUtils";
import Link from "next/link";

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDTO;
  onAddToCart: (request: CartItemRequest) => Promise<void>;
}

const VariantSelectionModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: VariantSelectionModalProps) => {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantDTO | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [variantsInCart, setVariantsInCart] = useState<Set<string>>(new Set());

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null);
      setQuantity(1);
      setIsLoading(false);
    } else {
      // Check cart status when modal opens
      checkVariantsInCart();
    }
  }, [isOpen]);

  // Check which variants are in cart
  const checkVariantsInCart = async () => {
    try {
      const cartItems = await CartService.getProductCartItems(product.productId);
      const variantIds = new Set(
        cartItems
          .filter(item => item.variantId)
          .map(item => item.variantId!)
      );
      setVariantsInCart(variantIds);
    } catch (error) {
      console.error("Error checking variants in cart:", error);
      setVariantsInCart(new Set());
    }
  };

  // Get available variants - show all active variants regardless of stock status
  const availableVariants =
    product.variants?.filter((variant) => variant.isActive) || [];

  // Debug logging
  console.log("Product variants:", product.variants);
  console.log("Available variants:", availableVariants);

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariantDTO) => {
    setSelectedVariant(variant);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (selectedVariant) {
      const totalStock = ProductService.getVariantTotalStock(selectedVariant);
      const isInStock = ProductService.isVariantInStock(selectedVariant);
      
      // If not in stock, don't allow any quantity
      if (!isInStock) return;
      
      // If we have exact stock quantity, enforce the limit
      if ((selectedVariant.warehouseStocks || selectedVariant.stockQuantity !== undefined) && totalStock > 0) {
        if (newQuantity > totalStock) return;
      }
      
      // For boolean isInStock without exact quantities, allow reasonable quantities (up to 10)
      if (!selectedVariant.warehouseStocks && selectedVariant.stockQuantity === undefined) {
        if (newQuantity > 10) return;
      }
    }
    
    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setIsLoading(true);
    try {
      await onAddToCart({
        variantId: selectedVariant.variantId.toString(),
        quantity,
      });
      
      // Update variants in cart after successful addition
      await checkVariantsInCart();
      
      // Trigger cart update event for header
      triggerCartUpdate();
      
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if product has an active discount
  const hasProductDiscount = () => {
    return (
      product.discountedPrice && product.discountedPrice < product.basePrice
    );
  };

  // Get effective discount for a variant (either variant-specific or product-level)
  const getEffectiveDiscount = (variant: ProductVariantDTO) => {
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
    if (hasProductDiscount()) {
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

  // Format price with discount
  const formatPrice = (price: number, variant?: ProductVariantDTO) => {
    if (variant) {
      const effectiveDiscount = getEffectiveDiscount(variant);
      if (effectiveDiscount) {
        const priceInfo = formatDiscountedPrice(
          price,
          effectiveDiscount.discountedPrice
        );

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-green-600">
              {formatPriceUtil(effectiveDiscount.discountedPrice)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatPriceUtil(price)}
            </span>
          </div>
        );
      }
    }

    return <span className="font-semibold">{formatPriceUtil(price)}</span>;
  };

  // Get main product image
  const getMainImage = () => {
    const primaryImage = product.images?.find((img) => img.isPrimary);
    return primaryImage?.url || product.images?.[0]?.url || "";
  };

  // Get variant image
  const getVariantImage = (variant: ProductVariantDTO) => {
    const primaryImage = variant.images?.find((img) => img.isPrimary);
    return primaryImage?.url || variant.images?.[0]?.url || getMainImage();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Select Variant
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Link href={`/product/${product.productId}`}>
                <Button variant="outline" size="sm" className="h-8">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Product
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription>
            Choose your preferred variant and quantity for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-md border">
              <img
                src={
                  selectedVariant
                    ? getVariantImage(selectedVariant)
                    : getMainImage()
                }
                alt={
                  selectedVariant ? selectedVariant.variantSku : product.name
                }
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {product.averageRating?.toFixed(1) || "0.0"} (
                  {product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Variant Selection */}
          <div className="space-y-4">
            {/* Available Variants */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Available Variants</Label>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {availableVariants.length > 0 ? (
                    availableVariants.map((variant) => (
                      <Card
                        key={variant.variantId}
                        className={`cursor-pointer transition-all ${
                          selectedVariant?.variantId === variant.variantId
                            ? "ring-2 ring-primary border-primary"
                            : variantsInCart.has(variant.variantId.toString())
                            ? "border-green-500 bg-green-50"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {/* Variant Image */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                                <img
                                  src={getVariantImage(variant)}
                                  alt={variant.variantSku}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Variant Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {variant.variantSku}
                                  </span>
                                  {selectedVariant?.variantId ===
                                    variant.variantId && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                  {variantsInCart.has(variant.variantId.toString()) && (
                                    <Badge variant="secondary" className="text-xs bg-green-500 text-white">
                                      In Cart
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-semibold text-sm">
                                  {formatPrice(variant.price, variant)}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                <span
                                  className={`flex items-center gap-1 ${
                                    ProductService.isVariantInStock(variant)
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  <Package className="h-3 w-3" />
                                  {(() => {
                                    const totalStock = ProductService.getVariantTotalStock(variant);
                                    const isInStock = ProductService.isVariantInStock(variant);
                                    
                                    if (!isInStock) {
                                      return "Out of stock";
                                    }
                                    
                                    // If we have exact stock quantity (from warehouseStocks or stockQuantity)
                                    if (variant.warehouseStocks || variant.stockQuantity !== undefined) {
                                      return `${totalStock} in stock`;
                                    }
                                    
                                    // If we only have isInStock boolean, show generic message
                                    return "In stock";
                                  })()}
                                </span>
                                {(() => {
                                  const effectiveDiscount =
                                    getEffectiveDiscount(variant);
                                  if (effectiveDiscount) {
                                    return (
                                      <Badge
                                        variant={
                                          effectiveDiscount.isVariantSpecific
                                            ? "destructive"
                                            : "secondary"
                                        }
                                        className={`text-xs ${
                                          effectiveDiscount.isVariantSpecific
                                            ? ""
                                            : "bg-orange-500 text-white"
                                        }`}
                                      >
                                        -
                                        {Math.round(
                                          effectiveDiscount.percentage
                                        )}
                                        % OFF
                                        {effectiveDiscount.isVariantSpecific
                                          ? ""
                                          : " (Product)"}
                                      </Badge>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>

                              {/* Variant Attributes */}
                              {variant.attributes &&
                                variant.attributes.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {variant.attributes.map((attr, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {attr.attributeType}:{" "}
                                        {attr.attributeValue}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>No variants available</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Quantity Selection */}
            {selectedVariant && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={
                      quantity <= 1 || !ProductService.isVariantInStock(selectedVariant)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={(() => {
                      const totalStock = ProductService.getVariantTotalStock(selectedVariant);
                      const isInStock = ProductService.isVariantInStock(selectedVariant);
                      
                      if (!isInStock) return 0;
                      
                      // If we have exact stock quantity
                      if (selectedVariant.warehouseStocks || selectedVariant.stockQuantity !== undefined) {
                        return totalStock > 0 ? totalStock : undefined;
                      }
                      
                      // For boolean isInStock, allow up to 10
                      return 10;
                    })()}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-20 text-center"
                    disabled={!ProductService.isVariantInStock(selectedVariant)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={(() => {
                      const totalStock = ProductService.getVariantTotalStock(selectedVariant);
                      const isInStock = ProductService.isVariantInStock(selectedVariant);
                      
                      if (!isInStock) return true;
                      
                      // If we have exact stock quantity
                      if (selectedVariant.warehouseStocks || selectedVariant.stockQuantity !== undefined) {
                        return quantity >= totalStock;
                      }
                      
                      // For boolean isInStock, limit to 10
                      return quantity >= 10;
                    })()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p
                  className={`text-xs ${
                    ProductService.isVariantInStock(selectedVariant)
                      ? "text-muted-foreground"
                      : "text-red-600"
                  }`}
                >
                  {(() => {
                    const totalStock = ProductService.getVariantTotalStock(selectedVariant);
                    const isInStock = ProductService.isVariantInStock(selectedVariant);
                    
                    if (!isInStock) {
                      return "Out of stock";
                    }
                    
                    // If we have exact stock quantity
                    if (selectedVariant.warehouseStocks || selectedVariant.stockQuantity !== undefined) {
                      return `${totalStock} available`;
                    }
                    
                    // For boolean isInStock, show generic message
                    return "Available";
                  })()}
                </p>
              </div>
            )}

            <Separator />

            {/* Selected Variant Summary */}
            {selectedVariant && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Summary</Label>
                <Card>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Variant:</span>
                        <span className="text-sm font-medium">
                          {selectedVariant.variantSku}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quantity:</span>
                        <span className="text-sm font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Price:</span>
                        <span className="text-sm font-medium">
                          {(() => {
                            const effectiveDiscount =
                              getEffectiveDiscount(selectedVariant);
                            if (effectiveDiscount) {
                              return formatPrice(
                                effectiveDiscount.discountedPrice
                              );
                            }
                            return formatPrice(selectedVariant.price);
                          })()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">
                          {(() => {
                            const effectiveDiscount =
                              getEffectiveDiscount(selectedVariant);
                            if (effectiveDiscount) {
                              return formatPrice(
                                effectiveDiscount.discountedPrice * quantity
                              );
                            }
                            return formatPrice(
                              selectedVariant.price * quantity
                            );
                          })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                isLoading ||
                !ProductService.isVariantInStock(selectedVariant)
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding to Cart...
                </>
              ) : selectedVariant && !ProductService.isVariantInStock(selectedVariant) ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Out of Stock
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VariantSelectionModal;
