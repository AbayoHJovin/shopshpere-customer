// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// API Endpoints
export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/products/${id}`,
  PRODUCT_BY_SLUG: (slug: string) => `${API_BASE_URL}/products/slug/${slug}`,
  SEARCH_PRODUCTS: `${API_BASE_URL}/products/search`,
  PRODUCT_REVIEWS: (productId: string) =>
    `${API_BASE_URL}/reviews/product/${productId}`,

  // Category endpoints
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id: string) => `${API_BASE_URL}/categories/${id}`,

  // Brand endpoints
  BRANDS: `${API_BASE_URL}/brands`,
  BRAND_BY_ID: (id: string) => `${API_BASE_URL}/brands/${id}`,

  // Attribute endpoints
  ATTRIBUTE_TYPES: `${API_BASE_URL}/product-attribute-types`,
  ATTRIBUTE_VALUES: `${API_BASE_URL}/product-attribute-values`,

  // Cart endpoints
  CART: `${API_BASE_URL}/cart`,
  CART_VIEW: `${API_BASE_URL}/cart/view`,
  CART_ADD: `${API_BASE_URL}/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/cart/update`,
  CART_REMOVE: (itemId: string) => `${API_BASE_URL}/cart/remove/${itemId}`,
  CART_CLEAR: `${API_BASE_URL}/cart/clear`,
  CART_HAS_ITEMS: `${API_BASE_URL}/cart/has-items`,
  CART_PRODUCTS: `${API_BASE_URL}/cart/products`,
  CART_ITEMS: `${API_BASE_URL}/cart/items`,
  CART_ITEM_BY_ID: (itemId: string) => `${API_BASE_URL}/cart/items/${itemId}`,
  CART_COUNT: `${API_BASE_URL}/cart/count`,

  // Wishlist endpoints
  WISHLIST: `${API_BASE_URL}/wishlist`,
  WISHLIST_ADD: `${API_BASE_URL}/wishlist/add`,
  WISHLIST_REMOVE: (productId: string) =>
    `${API_BASE_URL}/wishlist/remove/${productId}`,
  WISHLIST_MOVE_TO_CART: (productId: string) =>
    `${API_BASE_URL}/wishlist/move-to-cart/${productId}`,
  WISHLIST_CLEAR: `${API_BASE_URL}/wishlist/clear`,

  // Authentication endpoints
  AUTH_REGISTER: `${API_BASE_URL}/auth/users/register`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/users/login`,
  AUTH_ME: `${API_BASE_URL}/auth/users/me`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/users/logout`,
  AUTH_PASSWORD_RESET: `${API_BASE_URL}/auth/users/password-reset`,
  AUTH_VERIFY_RESET: `${API_BASE_URL}/auth/users/verify-reset`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/auth/users/reset-password`,

  // Order endpoints
  ORDERS: `${API_BASE_URL}/orders`,
  GUEST_ORDERS: `${API_BASE_URL}/guest/orders`,

  // Checkout endpoints
  CHECKOUT_CREATE_SESSION: `${API_BASE_URL}/checkout/create-user-session`,
  CHECKOUT_GUEST_CREATE_SESSION: `${API_BASE_URL}/checkout/guest/create-session`,
  CHECKOUT_VERIFY: `${API_BASE_URL}/checkout/verify`,

  // Landing page endpoints
  LANDING_PAGE: `${API_BASE_URL}/landing`,
  LANDING_TOP_SELLING: `${API_BASE_URL}/landing/top-selling`,
  LANDING_NEW_PRODUCTS: `${API_BASE_URL}/landing/new-products`,
  LANDING_DISCOUNTED: `${API_BASE_URL}/landing/discounted`,
  LANDING_CATEGORIES: `${API_BASE_URL}/landing/categories`,
  LANDING_BRANDS: `${API_BASE_URL}/landing/brands`,
} as const;

// HTTP Headers
export const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}
