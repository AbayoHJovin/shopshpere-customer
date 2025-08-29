const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface WishlistProduct {
  id: number;
  variantId: number;
  variantSku: string;
  productName: string;
  notes?: string;
  priority?: number;
  addedAt: string;
  inStock: boolean;
  availableStock: number;
  price: number;
  images?: Array<{
    imageId: number;
    url: string;
    altText?: string;
  }>;
}

export interface WishlistResponse {
  products: WishlistProduct[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface AddToWishlistRequest {
  variantId: number;
  notes?: string;
  priority?: number;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const WishlistService = {
  addToWishlist: async (
    request: AddToWishlistRequest
  ): Promise<WishlistProduct> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data;
  },

  getWishlist: async (page = 0, size = 10): Promise<WishlistResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(
      `${API_BASE_URL}/wishlist/view?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data;
  },

  removeFromWishlist: async (wishlistProductId: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(
      `${API_BASE_URL}/wishlist/remove/${wishlistProductId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
  },

  clearWishlist: async (): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
  },

  moveToCart: async (
    wishlistProductId: number,
    quantity = 1
  ): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(
      `${API_BASE_URL}/wishlist/move-to-cart/${wishlistProductId}?quantity=${quantity}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
  },

  isInWishlist: async (variantId: number): Promise<boolean> => {
    try {
      const wishlist = await WishlistService.getWishlist(0, 1000);
      return wishlist.products.some(
        (product) => product.variantId === variantId
      );
    } catch (error) {
      return false;
    }
  },
};
