// Types based on backend DTOs
export interface CartItemResponse {
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
  productId: string;
  quantity: number;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Service to interact with the Cart API
 */
export const CartService = {
  /**
   * Get the user's cart
   */
  getCart: async (page = 0, size = 10): Promise<CartResponse> => {
    // Check if we're in a client component
    if (typeof window === 'undefined') {
      throw new Error('This function should be called from client components only');
    }

    try {
      // In real implementation, we would make API call with authentication
      // const response = await fetch(`${API_BASE_URL}/cart?page=${page}&size=${size}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;

      // For now, use localStorage as a fallback
      return getCartFromLocalStorage();
    } catch (error) {
      console.error('Error fetching cart:', error);
      return getCartFromLocalStorage();
    }
  },

  /**
   * Add an item to the cart
   */
  addItemToCart: async (request: CartItemRequest): Promise<CartResponse> => {
    try {
      // In real implementation, we would make API call with authentication
      // const response = await fetch(`${API_BASE_URL}/cart`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(request)
      // });
      // const data = await response.json();
      // return data;

      // For now, use localStorage as a fallback
      return addToLocalStorageCart(request.productId, request.quantity);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return addToLocalStorageCart(request.productId, request.quantity);
    }
  },

  /**
   * Update an item in the cart
   */
  updateCartItem: async (productId: string, request: CartItemRequest): Promise<CartResponse> => {
    try {
      // In real implementation, we would make API call with authentication
      // const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(request)
      // });
      // const data = await response.json();
      // return data;

      // For now, use localStorage as a fallback
      return updateLocalStorageCartItem(productId, request.quantity);
    } catch (error) {
      console.error('Error updating cart item:', error);
      return updateLocalStorageCartItem(productId, request.quantity);
    }
  },

  /**
   * Remove an item from the cart
   */
  removeItemFromCart: async (productId: string): Promise<CartResponse> => {
    try {
      // In real implementation, we would make API call with authentication
      // const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;

      // For now, use localStorage as a fallback
      return removeFromLocalStorageCart(productId);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return removeFromLocalStorageCart(productId);
    }
  },

  /**
   * Clear the cart
   */
  clearCart: async (): Promise<MessageResponse> => {
    try {
      // In real implementation, we would make API call with authentication
      // const response = await fetch(`${API_BASE_URL}/cart`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;

      // For now, use localStorage as a fallback
      localStorage.setItem('cart', JSON.stringify([]));
      return {
        message: 'Cart cleared successfully',
        success: true
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      localStorage.setItem('cart', JSON.stringify([]));
      return {
        message: 'Cart cleared successfully (local only)',
        success: true
      };
    }
  },

  /**
   * Get the number of items in the cart
   */
  getCartItemsCount: async (): Promise<number> => {
    try {
      // In real implementation, we would make API call with authentication
      // const response = await fetch(`${API_BASE_URL}/cart/count`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();
      // return data;

      // For now, use localStorage as a fallback
      const cartItems = localStorage.getItem('cart');
      if (!cartItems) return 0;
      
      return JSON.parse(cartItems).length;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
};

// Helper functions for localStorage implementation
function getCartFromLocalStorage(): CartResponse {
  try {
    const cartItems = localStorage.getItem('cart');
    if (!cartItems) {
      return {
        cartId: 'local-cart',
        userId: 'local-user',
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalPages: 1,
        currentPage: 0,
      };
    }

    // Import the products from the data store
    // We would typically fetch this from an API
    // For this example, we're using the local data
    const { allProducts } = require('@/data/products');
    
    const cartIds = JSON.parse(cartItems) as string[];
    
    // Get product details for each cart item
    const cartItemsWithDetails: CartItemResponse[] = cartIds.reduce((acc: CartItemResponse[], id) => {
      const product = allProducts.find((p: any) => p.id === id);
      if (product) {
        const existingItem = acc.find(item => item.productId === id);
        
        if (existingItem) {
          // If item already exists, increment quantity
          existingItem.quantity += 1;
          existingItem.totalPrice = existingItem.quantity * existingItem.price;
          return acc;
        } else {
          // Add new item to cart
          const price = product.discountedPrice || product.price;
          const originalPrice = product.originalPrice || null;
          
          acc.push({
            id: `cart-item-${id}`,
            productId: id,
            name: product.name,
            price: price,
            previousPrice: originalPrice,
            imageUrl: product.image,
            quantity: 1,
            stock: product.stock || 100, // Use product stock or mock value
            totalPrice: price,
            averageRating: product.rating,
            ratingCount: product.reviewCount
          });
          return acc;
        }
      }
      return acc;
    }, []);
    
    // Calculate subtotal
    const subtotal = cartItemsWithDetails.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    
    return {
      cartId: 'local-cart',
      userId: 'local-user',
      items: cartItemsWithDetails,
      totalItems: cartItemsWithDetails.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      totalPages: 1,
      currentPage: 0,
    };
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return {
      cartId: 'local-cart',
      userId: 'local-user',
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalPages: 1,
      currentPage: 0,
    };
  }
}

function addToLocalStorageCart(productId: string, quantity: number): CartResponse {
  try {
    const cartItems = localStorage.getItem('cart');
    const cart = cartItems ? JSON.parse(cartItems) as string[] : [];
    
    // Add the product to the cart 'quantity' times
    for (let i = 0; i < quantity; i++) {
      cart.push(productId);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return getCartFromLocalStorage();
  } catch (error) {
    console.error('Error adding to localStorage cart:', error);
    return getCartFromLocalStorage();
  }
}

function updateLocalStorageCartItem(productId: string, quantity: number): CartResponse {
  try {
    const cartItems = localStorage.getItem('cart');
    const cart = cartItems ? JSON.parse(cartItems) as string[] : [];
    
    // Remove all instances of the product
    const filteredCart = cart.filter(id => id !== productId);
    
    // Add the product back with the new quantity
    for (let i = 0; i < quantity; i++) {
      filteredCart.push(productId);
    }
    
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    
    return getCartFromLocalStorage();
  } catch (error) {
    console.error('Error updating localStorage cart item:', error);
    return getCartFromLocalStorage();
  }
}

function removeFromLocalStorageCart(productId: string): CartResponse {
  try {
    const cartItems = localStorage.getItem('cart');
    const cart = cartItems ? JSON.parse(cartItems) as string[] : [];
    
    // Remove all instances of the product
    const filteredCart = cart.filter(id => id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    
    return getCartFromLocalStorage();
  } catch (error) {
    console.error('Error removing from localStorage cart:', error);
    return getCartFromLocalStorage();
  }
} 