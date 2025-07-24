"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Check,
  Star
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { allProducts } from "@/data/products";
import { toast } from "sonner";
import { CartService } from "@/lib/cartService";

// Interface for cart items in this component
interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  price: number;
  previousPrice: number | null;
  imageUrl: string;
  quantity: number;
  stock: number;
  totalPrice: number;
  averageRating: number;
  ratingCount: number;
}

interface CartResponseData {
  cartId: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  totalPages: number;
  currentPage: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isRemovingItem, setIsRemovingItem] = useState<string | null>(null);

  // Shipping options
  const shippingOptions = [
    { id: "free", name: "Free Shipping", price: 0 },
    { id: "standard", name: "Standard Shipping (3-5 business days)", price: 5.99 },
    { id: "express", name: "Express Shipping (1-2 business days)", price: 12.99 },
  ];
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].id);

  // Load cart from localStorage on component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Function to load cart data
  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await CartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  // Add function to dispatch cart updated event
  const dispatchCartUpdatedEvent = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Update the updateQuantity function to dispatch the event
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!cart) return;

    if (newQuantity < 1) newQuantity = 1;

    const updatedItems = cart.items.map(item => {
      if (item.productId === productId) {
        // Find the product to check stock
        const product = allProducts.find(p => p.id === productId);
        const maxStock = product?.inStock ? 100 : 0; // Mock value or use actual stock
        
        // Ensure quantity doesn't exceed stock
        if (newQuantity > maxStock) {
          newQuantity = maxStock;
          toast.warning(`Only ${maxStock} items available in stock.`);
        }
        
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.price * newQuantity,
        };
      }
      return item;
    });

    // Create updated cart
    const updatedCart = {
      ...cart,
      items: updatedItems,
      totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
    };

    setCart(updatedCart);
    
    try {
      await CartService.updateCartItem(productId, {
        productId,
        quantity: newQuantity
      });
      // Dispatch event to update cart count in header
      dispatchCartUpdatedEvent();
      // Don't show success toast for quantity updates to avoid UI noise
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart items.");
    }
  };

  // Update the removeItem function to dispatch the event
  const removeItem = async (productId: string) => {
    if (!cart) return;
    
    setIsRemovingItem(productId);
    
    setTimeout(async () => {
      const updatedItems = cart.items.filter(item => item.productId !== productId);
      
      // Create updated cart
      const updatedCart = {
        ...cart,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
      };
      
      setCart(updatedCart);
      
      try {
        await CartService.removeItemFromCart(productId);
        toast.success("Item removed from cart");
        dispatchCartUpdatedEvent();
      } catch (error) {
        console.error("Error removing item from cart:", error);
        toast.error("Failed to remove item from cart.");
      }
      
      setIsRemovingItem(null);
    }, 300);
  };

  // Update the clearCart function to dispatch the event
  const clearCart = async () => {
    setCart({
      cartId: "local-cart",
      userId: "local-user",
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalPages: 1,
      currentPage: 0,
    });
    try {
      await CartService.clearCart();
      toast.success("Cart cleared successfully");
      dispatchCartUpdatedEvent();
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart.");
    }
    setCouponApplied(false);
    setCouponCode("");
    setCouponDiscount(0);
  };

  // Function to apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    
    // Mock coupon validation
    if (couponCode.toUpperCase() === "DISCOUNT20") {
      setCouponApplied(true);
      setCouponDiscount(20);
      toast.success("Coupon applied successfully! 20% discount");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  // Get shipping cost
  const getShippingCost = () => {
    const option = shippingOptions.find(option => option.id === selectedShipping);
    return option ? option.price : 0;
  };

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!cart || !couponApplied) return 0;
    return (cart.subtotal * couponDiscount) / 100;
  };

  // Calculate total
  const getTotal = () => {
    if (!cart) return 0;
    return cart.subtotal + getShippingCost() - getDiscountAmount();
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-pulse space-y-4 w-full max-w-4xl">
            <div className="h-12 bg-muted rounded-md w-1/3"></div>
            <div className="h-96 bg-muted rounded-md w-full"></div>
            <div className="h-32 bg-muted rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Button size="lg" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Your Shopping Cart</h1>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href="/shop" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          {/* Desktop Cart View */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow 
                    key={item.productId} 
                    className={isRemovingItem === item.productId ? "opacity-50 transition-opacity" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/product/${item.productId}`} 
                          className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex flex-col">
                          <Link 
                            href={`/product/${item.productId}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(item.averageRating)
                                      ? "fill-rating-star text-rating-star"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.ratingCount})
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 text-sm self-start mt-1 h-7 px-2 text-muted-foreground hover:text-destructive" 
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{formatPrice(item.price)}</span>
                        {item.previousPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.previousPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex border rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="w-10 flex items-center justify-center bg-background">
                            {item.quantity}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(item.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Cart View */}
          <div className="md:hidden space-y-4">
            {cart.items.map((item) => (
              <Card 
                key={item.productId} 
                className={`overflow-hidden ${isRemovingItem === item.productId ? "opacity-50 transition-opacity" : ""}`}
              >
                <CardContent className="p-0">
                  <div className="flex gap-3">
                    <Link 
                      href={`/product/${item.productId}`} 
                      className="w-24 h-24 flex-shrink-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex flex-col p-3 flex-1">
                      <Link 
                        href={`/product/${item.productId}`}
                        className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center mt-1 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(item.averageRating)
                                  ? "fill-rating-star text-rating-star"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({item.ratingCount})
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="font-medium">{formatPrice(item.price)}</span>
                          {item.previousPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.previousPrice)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex border rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-none"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-8 flex items-center justify-center bg-background text-sm">
                              {item.quantity}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-none"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-destructive" 
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items from your cart. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={clearCart}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button variant="ghost" size="sm" asChild className="sm:hidden">
              <Link href="/shop" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Order Summary Section */}
        <div>
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted px-6 py-4">
              <h2 className="font-semibold text-lg">Order Summary</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              
              {/* Coupon Code */}
              <div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Coupon Code"
                    className="flex-1"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <Button 
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode.trim()} 
                    variant={couponApplied ? "outline" : "default"}
                    className="whitespace-nowrap"
                  >
                    {couponApplied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {couponApplied && (
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-muted-foreground">Discount ({couponDiscount}%)</span>
                    <span className="text-success">-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Shipping</span>
                <Select
                  value={selectedShipping}
                  onValueChange={setSelectedShipping}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shipping method" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex justify-between w-full">
                          <span>{option.name}</span>
                          <span>{option.price === 0 ? "Free" : formatPrice(option.price)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              
              {/* Estimated Delivery */}
              <div className="text-sm text-muted-foreground">
                <p>
                  {selectedShipping === "express" 
                    ? "Estimated delivery: 1-2 business days"
                    : selectedShipping === "standard"
                      ? "Estimated delivery: 3-5 business days"
                      : "Estimated delivery: 5-7 business days"}
                </p>
              </div>
              
              <Button className="w-full mt-4" size="lg">
                Proceed to Checkout
              </Button>
              
              {/* Payment options */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-medium">VISA</div>
                <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-medium">MC</div>
                <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-medium">AMEX</div>
                <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-medium">PYPL</div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Items in your cart are not reserved. Checkout now to secure your order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 