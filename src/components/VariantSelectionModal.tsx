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
  Hash,
  Star,
  Check,
  AlertCircle,
} from "lucide-react";
// import Image from "next/image"; // Fallback to regular img for now
import {
  ProductDTO,
  ProductVariantDTO,
  AddToCartRequest,
} from "@/lib/productService";

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDTO;
  onAddToCart: (request: AddToCartRequest) => Promise<void>;
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
      (variant) => variant.isActive && variant.isInStock
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
        variantId: selectedVariant.variantId,
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

  // Get primary image for variant
  const getVariantImage = (variant: ProductVariantDTO) => {
    const primaryImage = variant.images?.find((img) => img.isPrimary);
    return (
      primaryImage?.url || product.images?.find((img) => img.isPrimary)?.url
    );
  };

  // Group attributes by type
  const getGroupedAttributes = (variant: ProductVariantDTO) => {
    const grouped: Record<string, string[]> = {};
    variant.attributes?.forEach((attr) => {
      if (!grouped[attr.attributeType]) {
        grouped[attr.attributeType] = [];
      }
      grouped[attr.attributeType].push(attr.attributeValue);
    });
    return grouped;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Select Product Variant
          </DialogTitle>
          <DialogDescription>
            Choose from available variants of "{product.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Product Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            {product.images && product.images.length > 0 && (
              <div className="flex-shrink-0">
                <div className="w-20 h-20 relative rounded-md overflow-hidden">
                  <img
                    src={
                      product.images.find((img) => img.isPrimary)?.url ||
                      product.images[0].url
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="font-semibold text-lg">
                  {formatPrice(product.discountedPrice || product.basePrice)}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.salePrice)}
                  </span>
                )}
                {product.averageRating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.averageRating.toFixed(1)}</span>
                    {product.reviewCount && (
                      <span className="text-gray-500">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variants List */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Available Variants ({availableVariants.length})
            </h4>

            {availableVariants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No variants available for this product</p>
              </div>
            ) : (
              <ScrollArea className="max-h-60">
                <div className="space-y-3">
                  {availableVariants.map((variant) => {
                    const isSelected =
                      selectedVariant?.variantId === variant.variantId;
                    const variantImage = getVariantImage(variant);
                    const groupedAttributes = getGroupedAttributes(variant);

                    return (
                      <Card
                        key={variant.variantId}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "ring-2 ring-primary border-primary bg-primary/5"
                            : "hover:border-primary/50 hover:shadow-md"
                        }`}
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Variant Image */}
                            {variantImage && (
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 relative rounded-md overflow-hidden border">
                                  <img
                                    src={variantImage}
                                    alt={
                                      variant.variantName || variant.variantSku
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Variant Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-semibold">
                                      {variant.variantName || "Variant"}
                                    </h5>
                                    {isSelected && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                                      SKU: {variant.variantSku}
                                    </span>
                                    <span>
                                      Stock: {variant.stockQuantity} units
                                    </span>
                                  </div>

                                  {/* Attributes */}
                                  {Object.keys(groupedAttributes).length >
                                    0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {Object.entries(groupedAttributes).map(
                                        ([type, values]) => (
                                          <div
                                            key={type}
                                            className="flex flex-wrap gap-1"
                                          >
                                            {values.map((value, idx) => (
                                              <Badge
                                                key={`${type}-${value}-${idx}`}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {type}: {value}
                                              </Badge>
                                            ))}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <div className="font-semibold text-lg">
                                    {formatPrice(
                                      variant.salePrice || variant.price
                                    )}
                                  </div>
                                  {variant.salePrice &&
                                    variant.salePrice !== variant.price && (
                                      <div className="text-sm text-muted-foreground line-through">
                                        {formatPrice(variant.price)}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Quantity Selection and Add to Cart */}
          {selectedVariant && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium">
                      Quantity
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Max: {selectedVariant.stockQuantity} available
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className="w-20 text-center"
                      min={1}
                      max={selectedVariant.stockQuantity}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= selectedVariant.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold">
                    {formatPrice(
                      (selectedVariant.salePrice || selectedVariant.price) *
                        quantity
                    )}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isLoading || !selectedVariant}
                  >
                    {isLoading ? (
                      "Adding..."
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VariantSelectionModal;
