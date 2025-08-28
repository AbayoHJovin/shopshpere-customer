"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  LockIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

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
  OrderCreateRequest,
  OrderItemRequest,
} from "@/lib/orderService";

// Constants
const PAYMENT_METHODS = [
  { id: "credit_card", name: "Credit Card", icon: "/visa-mastercard.svg" },
  { id: "mtn_momo", name: "MTN Mobile Money", icon: "/mtn-momo.svg" },
];

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("credit_card");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<
    Omit<OrderCreateRequest, "items" | "totalAmount">
  >({
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

  // Credit card state
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  // Mobile Money state
  const [mobileMoneyInfo, setMobileMoneyInfo] = useState({
    phoneNumber: "",
    provider: "MTN",
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
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({
      ...prev,
      [name]:
        name === "cardNumber"
          ? formatCardNumber(value)
          : name === "expiryDate"
          ? formatExpiryDate(value)
          : value,
    }));
  };

  const handleMobileMoneyInfoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setMobileMoneyInfo((prev) => ({
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

    // In a real app, we would send the order to the backend
    // For now, simulate a successful order
    try {
      // In test mode, just generate a random order number and redirect
      setTimeout(() => {
        // Generate a random order number
        const orderNumber = `ORD-${Math.floor(
          100000 + Math.random() * 900000
        )}`;

        // Show success message
        toast.success("Order placed successfully!");

        // Clear cart
        CartService.clearCart();

        // Redirect to order success page with the order number
        router.push(`/order-success?orderNumber=${orderNumber}`);
      }, 1500);

      // Commented out real implementation for later
      /* 
      // Create order items from cart
      const orderItems: OrderItemRequest[] = cart!.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.productName
      }));
      
      // Create the order request
      const orderRequest: OrderCreateRequest = {
        ...formData,
        items: orderItems,
        totalAmount: cart!.total
      };
      
      // Submit the order (for authenticated user or guest)
      const orderResponse = await OrderService.createGuestOrder(orderRequest);
      
      // Show success message
      toast.success("Order placed successfully!");
      
      // Clear cart
      await CartService.clearCart();
      
      // Redirect to order success page
      router.push(`/order-success?orderNumber=${orderResponse.orderNumber}`);
      */
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Error placing order. Please try again later.");
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
    let isValid = true;
    const errors: string[] = [];

    if (activeTab === "credit_card") {
      // Validate credit card info
      if (
        !cardInfo.cardNumber ||
        cardInfo.cardNumber.replace(/\s/g, "").length < 16
      ) {
        isValid = false;
        errors.push("Card number is invalid");
      }

      if (!cardInfo.cardHolder) {
        isValid = false;
        errors.push("Card holder name is required");
      }

      if (!cardInfo.expiryDate || !/^\d{2}\/\d{2}$/.test(cardInfo.expiryDate)) {
        isValid = false;
        errors.push("Expiry date is invalid (MM/YY)");
      } else {
        // Validate expiry date is in the future
        const [month, year] = cardInfo.expiryDate.split("/");
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();

        if (expiryDate <= now) {
          isValid = false;
          errors.push("Card has expired");
        }
      }

      if (!cardInfo.cvv || !/^\d{3,4}$/.test(cardInfo.cvv)) {
        isValid = false;
        errors.push("CVV is invalid");
      }
    } else if (activeTab === "mtn_momo") {
      // Validate Mobile Money info
      if (
        !mobileMoneyInfo.phoneNumber ||
        mobileMoneyInfo.phoneNumber.length < 10
      ) {
        isValid = false;
        errors.push("Mobile money phone number is invalid");
      }
    }

    // Show errors if any
    if (!isValid) {
      toast.error(
        <div>
          <strong>Please fix the following payment errors:</strong>
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

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Limit to 16 digits
    const limitedDigits = digits.substring(0, 16);

    // Add spaces after every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, "$1 ");

    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as MM/YY
    if (digits.length >= 3) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    } else if (digits.length === 2) {
      return `${digits}/`;
    }
    return digits;
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
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs
                defaultValue="credit_card"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger
                    value="credit_card"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger
                    value="mtn_momo"
                    className="flex items-center gap-2"
                  >
                    <Image
                      src="/mtn-icon.png"
                      alt="MTN"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                    Mobile Money
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="credit_card" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={cardInfo.cardNumber}
                          onChange={handleCardInfoChange}
                          placeholder="1234 5678 9012 3456"
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-2.5">
                          <div className="flex items-center gap-1">
                            <Image
                              src="/visa-icon.png"
                              alt="Visa"
                              width={24}
                              height={16}
                              className="object-contain"
                            />
                            <Image
                              src="/mastercard-icon.png"
                              alt="Mastercard"
                              width={24}
                              height={16}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Card Holder Name</Label>
                      <Input
                        id="cardHolder"
                        name="cardHolder"
                        value={cardInfo.cardHolder}
                        onChange={handleCardInfoChange}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={cardInfo.expiryDate}
                          onChange={handleCardInfoChange}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={cardInfo.cvv}
                          onChange={handleCardInfoChange}
                          placeholder="123"
                          type="password"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center py-4 bg-muted/30 rounded-md">
                    <div className="flex items-center">
                      <LockIcon className="h-4 w-4 text-success mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Secured by SSL encryption
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mtn_momo" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="momoPhoneNumber">Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="momoPhoneNumber"
                          name="phoneNumber"
                          value={mobileMoneyInfo.phoneNumber}
                          onChange={handleMobileMoneyInfoChange}
                          placeholder="Enter your mobile money number"
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-2.5">
                          <Image
                            src="/mtn-icon.png"
                            alt="MTN"
                            width={24}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 text-amber-900 rounded-md">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          Payment Instructions
                        </p>
                        <p className="text-xs mt-1">
                          After clicking "Place Order", you'll receive a prompt
                          on your mobile phone to authorize the payment. Please
                          follow the instructions and enter your Mobile Money
                          PIN to complete the transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
                                  item.imageUrl ||
                                  "https://placehold.co/100x100?text=Product"
                                }
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            </Link>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">
                              {item.productName}
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
                    <span>{formatPrice(cart.total)}</span>
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
                      Processing...
                    </>
                  ) : (
                    <>Place Order</>
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
