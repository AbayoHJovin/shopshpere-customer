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
import { ProductDTO, ProductVariantDTO } from "@/lib/productService";
import { CartItemRequest } from "@/lib/cartService";
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

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null);
      setQuantity(1);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Get available variants
  const availableVariants =
    product.variants?.filter(
      (variant) => variant.isActive && variant.stockQuantity > 0
    ) || [];

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariantDTO) => {
    setSelectedVariant(variant);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (selectedVariant && newQuantity > selectedVariant.stockQuantity) return;
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
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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
            <div className="relative aspect-square overflow-hidden rounded-lg border">
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
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {/* Variant Image */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 relative rounded-md overflow-hidden border">
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
                                </div>
                                <span className="font-semibold text-sm">
                                  {formatPrice(variant.price)}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  {variant.stockQuantity} in stock
                                </span>
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
                                        {attr.attributeTypeName}:{" "}
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
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedVariant.stockQuantity}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= selectedVariant.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedVariant.stockQuantity} available
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
                          {formatPrice(selectedVariant.price)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">
                          {formatPrice(selectedVariant.price * quantity)}
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
              disabled={!selectedVariant || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding to Cart...
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
