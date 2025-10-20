"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WishlistService, WishlistProduct } from "@/lib/wishlistService";
import { ProductService, ProductDTO } from "@/lib/productService";
import { CartService, CartItemRequest } from "@/lib/cartService";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/store/hooks";
import { formatPrice } from "@/lib/utils/priceFormatter";
import VariantSelectionModal from "@/components/VariantSelectionModal";

export default function WishlistPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(10);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariantModal, setSelectedProductForVariantModal] =
    useState<ProductDTO | null>(null);

  // Fetch wishlist data
  const fetchWishlist = async (page = 0) => {
    try {
      setIsLoading(true);
      const response = await WishlistService.getWishlist(page, pageSize);
      setWishlistProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalProducts(response.totalProducts);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load your wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [currentPage, isAuthenticated]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (
    wishlistProductId: number | string
  ) => {
    try {
      setIsActionLoading(true);

      if (isAuthenticated) {
        // For authenticated users, use the wishlist item ID
        await WishlistService.removeFromWishlist(wishlistProductId as number);
      } else {
        // For guest users, remove by productId
        const product = wishlistProducts.find(
          (p) => p.id === wishlistProductId
        );
        if (product) {
          await WishlistService.removeFromWishlist(product.productId);
        }
      }

      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });

      // Refresh the current page
      await fetchWishlist(currentPage);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description:
          "Failed to remove product from wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle move to cart
  const handleMoveToCart = async (wishlistProduct: WishlistProduct) => {
    try {
      setIsActionLoading(true);

      // Check if the product has variants
      const product = await ProductService.getProductById(
        wishlistProduct.productId
      );

      if (product.variants && product.variants.length > 0) {
        // Show variant selection modal for products with variants
        setSelectedProductForVariantModal(product);
        setShowVariantModal(true);
      } else {
        // For products without variants, add directly to cart
        if (isAuthenticated) {
          // For authenticated users, use the move to cart functionality
          await WishlistService.moveToCart(wishlistProduct.id, 1);
        } else {
          // For guest users, add to cart directly
          await CartService.addItemToCart({
            productId: wishlistProduct.productId,
            quantity: 1,
          });
        }

        toast({
          title: "Moved to cart",
          description: "Product has been moved to your cart.",
        });

        // Refresh the current page
        await fetchWishlist(currentPage);
      }
    } catch (error) {
      console.error("Error moving to cart:", error);
      toast({
        title: "Error",
        description: "Failed to move product to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    try {
      setIsActionLoading(true);
      await WishlistService.clearWishlist();

      toast({
        title: "Wishlist cleared",
        description: "All products have been removed from your wishlist.",
      });

      // Refresh the current page
      await fetchWishlist(0);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to clear wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle add to cart from variant modal
  const handleAddToCart = async (request: CartItemRequest) => {
    try {
      setIsActionLoading(true);

      // Add the variant to cart
      await CartService.addItemToCart({
        variantId: request.variantId,
        quantity: request.quantity,
      });

      toast({
        title: "Added to cart",
        description: "Product variant has been added to your cart.",
      });

      // Close the modal
      setShowVariantModal(false);
      setSelectedProductForVariantModal(null);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your wishlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hidden sm:flex"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">My Wishlist</h1>
                <p className="text-muted-foreground">
                  {totalProducts} {totalProducts === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            {wishlistProducts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isActionLoading}>
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove all products from your
                      wishlist? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearWishlist}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Guest User Banner */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                <strong>Guest Mode:</strong> You're viewing your local wishlist.
                <Link href="/auth/login" className="underline ml-1">
                  Sign in
                </Link>{" "}
                to sync your wishlist across all devices and never lose your
                saved items.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/auth/login")}
              className="ml-4"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to your wishlist to save them for later.
            </p>
            <Button onClick={() => router.push("/shop")}>
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wishlistProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                              {product.productImage ? (
                                <img
                                  src={product.productImage}
                                  alt={product.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Package className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {product.productName}
                                </h3>
                                {product.hasActiveDiscount &&
                                  product.discountInfo?.active && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      {product.discountInfo.percentage}% OFF
                                    </Badge>
                                  )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                SKU: {product.productSku}
                              </p>
                              {product.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Note: {product.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {product.hasActiveDiscount &&
                            product.discountInfo?.active ? (
                              <>
                                <span className="font-medium text-green-600">
                                  {formatPrice(product.finalPrice || 0)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.price || 0)}
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  {product.discountInfo.percentage}% OFF
                                </span>
                              </>
                            ) : (
                              <span className="font-medium">
                                {formatPrice(product.price || 0)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.inStock ? "outline" : "destructive"
                            }
                            className="text-xs"
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                          {product.inStock && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {product.availableStock} available
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(product.addedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMoveToCart(product)}
                              disabled={isActionLoading || !product.inStock}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Move to Cart
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isActionLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove from Wishlist
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove "
                                    {product.productName}" from your wishlist?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveFromWishlist(product.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {wishlistProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">
                            {product.productName}
                          </h3>
                          {product.hasActiveDiscount &&
                            product.discountInfo?.active && (
                              <Badge variant="destructive" className="text-xs">
                                {product.discountInfo.percentage}% OFF
                              </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.productSku}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {product.hasActiveDiscount &&
                          product.discountInfo?.active ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-green-600">
                                {formatPrice(product.finalPrice || 0)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price || 0)}
                              </span>
                              <span className="text-xs text-green-600 font-medium">
                                {product.discountInfo.percentage}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {formatPrice(product.price || 0)}
                            </span>
                          )}
                          <Badge
                            variant={
                              product.inStock ? "outline" : "destructive"
                            }
                            className="text-xs"
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        {product.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Note: {product.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveToCart(product)}
                            disabled={isActionLoading || !product.inStock}
                            className="flex-1"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Move to Cart
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isActionLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove from Wishlist
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "
                                  {product.productName}" from your wishlist?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRemoveFromWishlist(product.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 0
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages - 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Variant Selection Modal */}
      {selectedProductForVariantModal && (
        <VariantSelectionModal
          isOpen={showVariantModal}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedProductForVariantModal(null);
          }}
          product={selectedProductForVariantModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
