"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, LockIcon, Loader2 } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { PaymentIcons } from "@/components/PaymentIcons";

// Services
import { CartService, CartResponse } from "@/lib/cartService";
import {
  OrderService,
  CheckoutRequest,
  GuestCheckoutRequest,
  CartItemDTO,
  AddressDto,
} from "@/lib/orderService";
import { useAppSelector } from "@/lib/store/hooks";

// Constants
const PAYMENT_METHODS = [
  {
    id: "credit_card",
    name: "Credit Card",
    icon: "/visa-mastercard.svg",
    description: "Pay with Visa, Mastercard, or other major cards",
  },
  {
    id: "mtn_momo",
    name: "MTN Mobile Money",
    icon: "/mtn-momo.svg",
    description: "Pay using your MTN Mobile Money account",
  },
];

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // State
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("credit_card");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load cart
        const cartData = await CartService.getCart();
        setCart(cartData);

        // Check if cart is empty
        if (!cartData || cartData.items.length === 0) {
          toast.error("Your cart is empty. Add some products before checkout.");
          setTimeout(() => {
            router.push("/shop");
          }, 2000);
          return;
        }

        // Pre-populate form data for authenticated users
        if (isAuthenticated && user) {
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          }));
        }

        // Get countries for dropdown
        const countriesList = await OrderService.getCountries();
        setCountries(countriesList);
      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Error loading checkout data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !validatePaymentInfo()) {
      return;
    }

    setSubmitting(true);

    try {
      const cartItems: CartItemDTO[] = cart!.items
        .filter((item) => item.id && item.productId) // Only require id and productId
        .map((item) => {
          // For guest users, id is a string (localStorage itemId)
          // For authenticated users, id might be a number
          let itemId: number | undefined;
          if (isAuthenticated) {
            // For authenticated users, try to parse as number
            const parsedId = parseInt(item.id);
            if (!isNaN(parsedId)) {
              itemId = parsedId;
            }
          }
          // For guest users, we don't need a numeric id

          // Handle variantId if present
          let variantId: number | undefined;
          if (item.variantId) {
            const parsedVariantId = parseInt(item.variantId);
            if (!isNaN(parsedVariantId)) {
              variantId = parsedVariantId;
            }
          }

          const cartItem: any = {
            productId: item.productId, // Keep as string (backend will parse it)
            productName: item.name || "Unknown Product",
            productImage: item.url || "",
            quantity: item.quantity || 1,
            price: item.price || 0,
            totalPrice:
              item.totalPrice || (item.price || 0) * (item.quantity || 1),
            inStock: (item.stock || 0) > 0,
            availableStock: item.stock || 0,
            isVariantBased: !!variantId, // true if variantId exists, false otherwise
          };

          // Only include id for authenticated users
          if (isAuthenticated && itemId !== undefined) {
            cartItem.id = itemId;
          }

          // Only include variantId if it exists
          if (variantId !== undefined) {
            cartItem.variantId = variantId;
          }

          return cartItem;
        })
        .filter((item) => item !== null) as CartItemDTO[]; // Remove null items and type assert

      // Validate that we have valid cart items
      if (cartItems.length === 0) {
        toast.error(
          "No valid items found in cart. Please refresh and try again."
        );
        setSubmitting(false);
        return;
      }

      // Create address object
      const address: AddressDto = {
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.stateProvince,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      let sessionUrl: string;

      if (isAuthenticated && user) {
        // Authenticated user checkout
        const checkoutRequest: CheckoutRequest = {
          items: cartItems,
          shippingAddress: address,
          currency: "usd",
          userId: user.id,
          platform: "web",
        };

        console.log("Sending checkout request:", checkoutRequest); // Debug log
        const response = await OrderService.createCheckoutSession(
          checkoutRequest
        );
        sessionUrl = response.sessionUrl;
      } else {
        // Guest checkout
        const guestCheckoutRequest: GuestCheckoutRequest = {
          guestName: formData.firstName,
          guestLastName: formData.lastName,
          guestEmail: formData.email,
          guestPhone: formData.phoneNumber,
          address: address,
          items: cartItems,
          platform: "web",
        };

        console.log("Sending guest checkout request:", guestCheckoutRequest); // Debug log
        const response = await OrderService.createGuestCheckoutSession(
          guestCheckoutRequest
        );
        sessionUrl = response.sessionUrl;
      }

      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Error processing checkout. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    // Required fields for shipping info
    const requiredFields = [
      "email",
      "firstName",
      "lastName",
      "phoneNumber",
      "streetAddress",
      "city",
      "stateProvince",
      "postalCode",
      "country",
    ];

    let isValid = true;
    const errors: string[] = [];

    // Check required fields
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        isValid = false;
        errors.push(
          `${
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
          } is required`
        );
      }
    });

    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      isValid = false;
      errors.push("Email is not valid");
    }

    // Phone number validation
    if (
      formData.phoneNumber &&
      !/^\+?[0-9\s\-()]{8,20}$/.test(formData.phoneNumber)
    ) {
      isValid = false;
      errors.push("Phone number is not valid");
    }

    // Show errors if any
    if (!isValid) {
      toast.error(
        <div>
          <strong>Please fix the following errors:</strong>
          <ul className="list-disc pl-4 mt-2">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      );
    }

    return isValid;
  };

  const validatePaymentInfo = () => {
    // Since we're using Stripe, payment validation is handled by Stripe
    // We just need to ensure the form is valid
    return true;
  };

  const calculateSubtotal = () => {
    if (!cart) return 0;
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading checkout information...
        </p>
      </div>
    );
  }

  // Handle empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-2">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Return to Cart
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden animate-slide-in-right card-animation-delay-1">
            <CardHeader className="bg-muted">
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Enter your contact information</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number*</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name*</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name*</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden animate-slide-in-right card-animation-delay-2">
            <CardHeader className="bg-muted">
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>
                Where should we deliver your order?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address*</Label>
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Apt 4B"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City*</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateProvince">State/Province*</Label>
                  <Input
                    id="stateProvince"
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code*</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country*</Label>
                  <Select
                    value={formData.country}
                    onValueChange={handleCountryChange}
                    required
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special delivery instructions or other notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden animate-slide-in-right card-animation-delay-3">
            <CardHeader className="bg-muted">
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Secure Payment
                      </h3>
                      <p className="text-sm text-blue-700">
                        Your payment will be processed securely by Stripe. We
                        accept all major credit cards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Image
                      src="/visa-icon.png"
                      alt="Visa"
                      width={32}
                      height={20}
                      className="object-contain"
                    />
                    <span className="text-sm font-medium">Visa</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Image
                      src="/mastercard-icon.png"
                      alt="Mastercard"
                      width={32}
                      height={20}
                      className="object-contain"
                    />
                    <span className="text-sm font-medium">Mastercard</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center py-4 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <LockIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Secured by Stripe • SSL encrypted
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6 animate-slide-in-left">
            <Card>
              <CardHeader className="bg-muted">
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {cart.items.length}{" "}
                  {cart.items.length === 1 ? "item" : "items"} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue="items"
                >
                  <AccordionItem value="items">
                    <AccordionTrigger>View Cart Items</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {cart.items.map((item) => (
                        <div key={item.productId} className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                            <Link href={`/product/${item.productId}`}>
                              <img
                                src={
                                  item.url ||
                                  "https://placehold.co/100x100?text=Product"
                                }
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </Link>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">
                              {item.name}
                            </p>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-muted-foreground">
                                {item.quantity} × ${item.price.toFixed(2)}
                              </span>
                              <span className="text-sm font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-success">Free</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 px-6 py-4 flex flex-col gap-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  By placing your order, you agree to our{" "}
                  <Link href="#" className="underline hover:text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                </div>

                <div className="pt-2">
                  <PaymentIcons />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <LockIcon className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">
                    Secure Checkout
                  </span>
                </div>

                <div className="flex items-center justify-center mt-4">
                  <Image
                    src="/secure-payment.png"
                    alt="Secure Payment"
                    width={160}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </CardFooter>
            </Card>

            {/* Support Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our customer service team is available 24/7 to assist you with
                  your order.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Live Chat
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Call Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
