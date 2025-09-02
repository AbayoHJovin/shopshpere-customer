// Types based on backend DTOs
export interface CreateOrderRequest {
  userId: string;
  items: CreateOrderItemRequest[];
  shippingAddress: CreateOrderAddressRequest;
  billingAddress?: CreateOrderAddressRequest;
  paymentMethod: string;
  notes?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CreateOrderAddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface CheckoutRequest {
  items: CartItemDTO[];
  shippingAddress: AddressDto;
  currency?: string;
  userId?: string;
}

export interface GuestCheckoutRequest {
  guestName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  address: AddressDto;
  items: CartItemDTO[];
}

export interface CartItemDTO {
  id?: number;
  productId?: string;
  variantId?: number;
  sku?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  addedAt?: string;
  inStock?: boolean;
  availableStock?: number;
  isVariantBased?: boolean;
}

export interface AddressDto {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutVerificationResult {
  status: string;
  amount: number;
  currency: string;
  customerEmail: string;
  receiptUrl: string;
  paymentIntentId: string;
  sessionId: string;
  updated: boolean;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  email: string;
  firstName: string;
  lastName: string;
  totalAmount: number;
  createdAt: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  path: string;
  timestamp: string;
}

// Import centralized API configuration
import { API_ENDPOINTS } from "./api";

/**
 * Service to interact with the Order and Checkout APIs
 */
export const OrderService = {
  /**
   * Create a checkout session for authenticated user
   */
  createCheckoutSession: async (
    request: CheckoutRequest
  ): Promise<{ sessionUrl: string }> => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_ENDPOINTS.CHECKOUT_CREATE_SESSION}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating checkout session");
      }

      const data = await response.json();
      return { sessionUrl: data.sessionUrl };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },

  /**
   * Create a checkout session for guest user
   */
  createGuestCheckoutSession: async (
    request: GuestCheckoutRequest
  ): Promise<{ sessionUrl: string }> => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CHECKOUT_GUEST_CREATE_SESSION}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error creating guest checkout session"
        );
      }

      const data = await response.json();
      return { sessionUrl: data.sessionUrl };
    } catch (error) {
      console.error("Error creating guest checkout session:", error);
      throw error;
    }
  },

  /**
   * Verify checkout session
   */
  verifyCheckoutSession: async (
    sessionId: string
  ): Promise<CheckoutVerificationResult> => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CHECKOUT_VERIFY}/${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error verifying checkout session"
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error verifying checkout session:", error);
      throw error;
    }
  },

  /**
   * Create an order for an authenticated user (direct order creation)
   */
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_ENDPOINTS.ORDERS}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating order");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Get available countries for shipping
   * In a real implementation, this would be fetched from an API
   */
  getCountries: async (): Promise<string[]> => {
    // Mock implementation
    return [
      "United States",
      "Canada",
      "United Kingdom",
      "Australia",
      "Germany",
      "France",
      "Spain",
      "Italy",
      "Japan",
      "China",
      "India",
      "Brazil",
      "South Africa",
      "Nigeria",
      "Kenya",
      "Ghana",
      "Rwanda",
    ];
  },
};
