// Types based on backend DTOs
export interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  price: number;
  previousPrice: number | null;
  url: string;
  quantity: number;
  stock: number;
  totalPrice: number;
  averageRating: number;
  ratingCount: number;
}

export interface CartResponse {
  cartId: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  totalPages: number;
  currentPage: number;
}

export interface CartItemRequest {
  productId?: string;
  variantId?: string;
  quantity: number;
}

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export interface MessageResponse {
  message: string;
  success: boolean;
}

/**
 * Service to interact with the Cart API
 */
export const CartService = {
  /**
   * Get the user's cart
   */
  getCart: async (page = 0, size = 10): Promise<CartResponse> => {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No authentication token found, using localStorage fallback"
      );
      return getCartFromLocalStorage();
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/cart/view?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication failed, using localStorage fallback");
          return getCartFromLocalStorage();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform backend response to match frontend interface
      const backendData = data.data;
      return {
        cartId: backendData.cartId?.toString() || "",
        userId: backendData.userId?.toString() || "",
        items:
          backendData.items?.map((item: any) => ({
            id: item.id?.toString() || "",
            productId:
              item.variantId?.toString() || item.productId?.toString() || "",
            name: item.productName || item.name || "",
            price: item.price || 0,
            previousPrice: item.previousPrice || null,
            url: item.productImage || item.url || "",
            quantity: item.quantity || 0,
            stock: item.availableStock || item.stock || 0,
            totalPrice: item.totalPrice || 0,
            averageRating: item.averageRating || 0,
            ratingCount: item.ratingCount || 0,
          })) || [],
        totalItems: backendData.totalItems || 0,
        subtotal: backendData.subtotal || backendData.total || 0,
        totalPages: data.pagination?.totalPages || 1,
        currentPage: data.pagination?.page || 0,
      };
    } catch (error) {
      console.error("Error fetching cart:", error);
      return getCartFromLocalStorage();
    }
  },

  /**
   * Add an item to the cart
   */
  addItemToCart: async (request: CartItemRequest): Promise<CartResponse> => {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No authentication token found, using localStorage fallback"
      );
      return addToLocalStorageCart(
        request.productId || request.variantId || "",
        request.quantity
      );
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication failed, using localStorage fallback");
          return addToLocalStorageCart(
            request.productId || request.variantId || "",
            request.quantity
          );
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Trigger cart update event
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      return data.data;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return addToLocalStorageCart(
        request.productId || request.variantId || "",
        request.quantity
      );
    }
  },

  /**
   * Update an item in the cart
   */
  updateCartItem: async (
    itemId: string,
    request: CartItemRequest
  ): Promise<CartResponse> => {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No authentication token found, using localStorage fallback"
      );
      return updateLocalStorageCartItem(itemId, request.quantity);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: parseInt(itemId),
          quantity: request.quantity,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication failed, using localStorage fallback");
          return updateLocalStorageCartItem(itemId, request.quantity);
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Trigger cart update event
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Return updated cart by fetching it again
      return await CartService.getCart();
    } catch (error) {
      console.error("Error updating cart item:", error);
      return updateLocalStorageCartItem(itemId, request.quantity);
    }
  },

  /**
   * Remove an item from the cart
   */
  removeItemFromCart: async (itemId: string): Promise<CartResponse> => {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No authentication token found, using localStorage fallback"
      );
      return removeFromLocalStorageCart(itemId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication failed, using localStorage fallback");
          return removeFromLocalStorageCart(itemId);
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Trigger cart update event
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Return updated cart by fetching it again
      return await CartService.getCart();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      return removeFromLocalStorageCart(itemId);
    }
  },

  /**
   * Clear the cart
   */
  clearCart: async (): Promise<MessageResponse> => {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No authentication token found, using localStorage fallback"
      );
      localStorage.setItem("cart", JSON.stringify([]));
      return {
        message: "Cart cleared successfully (local only)",
        success: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication failed, using localStorage fallback");
          localStorage.setItem("cart", JSON.stringify([]));
          return {
            message: "Cart cleared successfully (local only)",
            success: true,
          };
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Trigger cart update event
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      return data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      localStorage.setItem("cart", JSON.stringify([]));
      return {
        message: "Cart cleared successfully (local only)",
        success: true,
      };
    }
  },

  /**
   * Get the number of items in the cart
   */
  getCartItemsCount: async (): Promise<number> => {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No authentication token found, using localStorage fallback"
      );
      const cartItems = localStorage.getItem("cart");
      if (!cartItems) return 0;
      return JSON.parse(cartItems).length;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/has-items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication failed, using localStorage fallback");
          const cartItems = localStorage.getItem("cart");
          if (!cartItems) return 0;
          return JSON.parse(cartItems).length;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data.hasItems ? 1 : 0;
    } catch (error) {
      console.error("Error getting cart item count:", error);
      const cartItems = localStorage.getItem("cart");
      if (!cartItems) return 0;
      return JSON.parse(cartItems).length;
    }
  },
};

// Helper functions for localStorage implementation
function getCartFromLocalStorage(): CartResponse {
  try {
    const cartItems = localStorage.getItem("cart");
    if (!cartItems) {
      return {
        cartId: "local-cart",
        userId: "local-user",
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalPages: 1,
        currentPage: 0,
      };
    }

    const cartIds = JSON.parse(cartItems) as string[];

    // Create a simple cart response without requiring product data
    // In a real implementation, this would fetch product details from the backend
    const cartItemsWithDetails: CartItemResponse[] = cartIds.reduce(
      (acc: CartItemResponse[], id) => {
        const existingItem = acc.find((item) => item.productId === id);

        if (existingItem) {
          // If item already exists, increment quantity
          existingItem.quantity += 1;
          existingItem.totalPrice = existingItem.quantity * existingItem.price;
          return acc;
        } else {
          // Add new item to cart with placeholder data
          // In real implementation, this would fetch from backend
          acc.push({
            id: `cart-item-${id}`,
            productId: id,
            name: `Product ${id}`, // Placeholder name
            price: 0, // Will be updated when product details are fetched
            previousPrice: null,
            url: "", // Will be updated when product details are fetched
            quantity: 1,
            stock: 100, // Placeholder stock
            totalPrice: 0, // Will be calculated when price is known
            averageRating: 0,
            ratingCount: 0,
          });
          return acc;
        }
      },
      []
    );

    // Calculate subtotal
    const subtotal = cartItemsWithDetails.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    return {
      cartId: "local-cart",
      userId: "local-user",
      items: cartItemsWithDetails,
      totalItems: cartItemsWithDetails.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      subtotal,
      totalPages: 1,
      currentPage: 0,
    };
  } catch (error) {
    console.error("Error getting cart from localStorage:", error);
    return {
      cartId: "local-cart",
      userId: "local-user",
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalPages: 1,
      currentPage: 0,
    };
  }
}

function addToLocalStorageCart(
  productId: string,
  quantity: number
): CartResponse {
  try {
    const cartItems = localStorage.getItem("cart");
    const cart = cartItems ? (JSON.parse(cartItems) as string[]) : [];

    // Add the product to the cart 'quantity' times
    for (let i = 0; i < quantity; i++) {
      cart.push(productId);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    return getCartFromLocalStorage();
  } catch (error) {
    console.error("Error adding to localStorage cart:", error);
    return getCartFromLocalStorage();
  }
}

function updateLocalStorageCartItem(
  productId: string,
  quantity: number
): CartResponse {
  try {
    const cartItems = localStorage.getItem("cart");
    const cart = cartItems ? (JSON.parse(cartItems) as string[]) : [];

    // Remove all instances of the product
    const filteredCart = cart.filter((id) => id !== productId);

    // Add the product back with the new quantity
    for (let i = 0; i < quantity; i++) {
      filteredCart.push(productId);
    }

    localStorage.setItem("cart", JSON.stringify(filteredCart));

    return getCartFromLocalStorage();
  } catch (error) {
    console.error("Error updating localStorage cart item:", error);
    return getCartFromLocalStorage();
  }
}

function removeFromLocalStorageCart(productId: string): CartResponse {
  try {
    const cartItems = localStorage.getItem("cart");
    const cart = cartItems ? (JSON.parse(cartItems) as string[]) : [];

    const filteredCart = cart.filter((id) => id !== productId);

    localStorage.setItem("cart", JSON.stringify(filteredCart));

    return getCartFromLocalStorage();
  } catch (error) {
    console.error("Error removing from localStorage cart:", error);
    return getCartFromLocalStorage();
  }
}
