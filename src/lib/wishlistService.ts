import { API_ENDPOINTS, getAuthHeaders } from "./api";
import { ManyProductsDto } from "./productService";

export interface WishlistProduct {
  id: number;
  productId: string;
  productSku: string;
  productName: string;
  productImage: string | null;
  notes: string | null;
  priority: number;
  addedAt: string;
  inStock: boolean;
  availableStock: number;
  price: number;
  finalPrice: number;
  hasActiveDiscount?: boolean;
  discountInfo?: {
    discountId: string;
    name: string;
    percentage: number;
    startDate: string;
    endDate: string;
    active: boolean;
    discountCode?: string;
  } | null;
  compareAtPrice?: number | null;
}

export interface WishlistResponse {
  products: WishlistProduct[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
}

export interface AddToWishlistRequest {
  productId: string;
  notes?: string;
  priority?: number;
}

export interface UpdateWishlistProductRequest {
  wishlistProductId: number;
  notes?: string;
  priority?: number;
}

// Interface for localStorage wishlist items (simplified)
interface LocalStorageWishlistItem {
  id: string;
  productId: string;
  addedAt: string;
}

// Interface for backend products by IDs request
interface ProductsByIdsRequest {
  productIds: string[];
}

// Interface for backend products by IDs response
interface ProductsByIdsResponse {
  products: ManyProductsDto[];
  totalProducts: number;
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

class WishlistServices {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async addToWishlist(request: AddToWishlistRequest): Promise<WishlistProduct> {
    const token = getAuthToken();

    if (!token) {
      // No token = guest user, use localStorage
      addToLocalStorageWishlist(request.productId);
      // Return a mock response for consistency
      return {
        id: Date.now(),
        productId: request.productId,
        productSku: "",
        productName: "",
        productImage: null,
        notes: request.notes || null,
        priority: request.priority || 1,
        addedAt: new Date().toISOString(),
        inStock: true,
        availableStock: 0,
        price: 0,
        finalPrice: 0,
      };
    }

    const response = await fetch(`${this.baseUrl}/wishlist/add`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear it and treat as guest
        localStorage.removeItem("authToken");
        console.warn("Authentication token expired, treating as guest user");
        addToLocalStorageWishlist(request.productId);
        return {
          id: Date.now(),
          productId: request.productId,
          productSku: "",
          productName: "",
          productImage: null,
          notes: request.notes || null,
          priority: request.priority || 1,
          addedAt: new Date().toISOString(),
          inStock: true,
          availableStock: 0,
          price: 0,
          finalPrice: 0,
        };
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to add to wishlist");
    }

    const result = await response.json();
    return result.data;
  }

  async getWishlist(
    page: number = 0,
    size: number = 10
  ): Promise<WishlistResponse> {
    const token = getAuthToken();

    if (!token) {
      // No token = guest user, use localStorage
      return await getWishlistFromBackend();
    }

    const response = await fetch(
      `${this.baseUrl}/wishlist/view?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear it and treat as guest
        localStorage.removeItem("authToken");
        console.warn("Authentication token expired, treating as guest user");
        return await getWishlistFromBackend();
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch wishlist");
    }

    const result = await response.json();
    return {
      products: result.data.products,
      totalProducts: result.data.totalProducts,
      currentPage: result.pagination.page,
      totalPages: result.pagination.totalPages,
    };
  }

  async removeFromWishlist(wishlistProductId: number | string): Promise<void> {
    const token = getAuthToken();

    if (!token) {
 
      if (typeof wishlistProductId === "string") {
        removeFromLocalStorageWishlistByProductId(wishlistProductId);
      } else {
        removeFromLocalStorageWishlist(wishlistProductId.toString());
      }
      return;
    }

    const response = await fetch(
      `${this.baseUrl}/wishlist/remove/${wishlistProductId}`,
      {
        method: "DELETE",
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear it and treat as guest
        localStorage.removeItem("authToken");
        console.warn("Authentication token expired, treating as guest user");
        removeFromLocalStorageWishlist(wishlistProductId.toString());
        return;
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to remove from wishlist");
    }
  }

  async clearWishlist(): Promise<void> {
    const token = getAuthToken();

    if (!token) {
      // No token = guest user, use localStorage
      localStorage.setItem("wishlist", JSON.stringify([]));
      return;
    }

    const response = await fetch(`${this.baseUrl}/wishlist/clear`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear it and treat as guest
        localStorage.removeItem("authToken");
        console.warn("Authentication token expired, treating as guest user");
        localStorage.setItem("wishlist", JSON.stringify([]));
        return;
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to clear wishlist");
    }
  }

  async moveToCart(
    wishlistProductId: number,
    quantity: number = 1
  ): Promise<void> {
    const token = getAuthToken();

    if (!token) {
      // No token = guest user, can't move to cart without authentication
      throw new Error("Authentication required to move items to cart");
    }

    const response = await fetch(
      `${this.baseUrl}/wishlist/move-to-cart/${wishlistProductId}?quantity=${quantity}`,
      {
        method: "POST",
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        console.warn("Authentication token expired");
        throw new Error("Authentication required to move items to cart");
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to move to cart");
    }
  }

  async isInWishlist(productId: string): Promise<boolean> {
    const token = getAuthToken();

    if (!token) {
      // No token = guest user, check localStorage
      const wishlistItems = localStorage.getItem("wishlist");
      if (!wishlistItems) return false;

      const wishlist = JSON.parse(wishlistItems) as LocalStorageWishlistItem[];
      return wishlist.some((item) => item.productId === productId);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/wishlist/view?page=0&size=1000`,
        {
          method: "GET",
          headers: await this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid - clear it and treat as guest
          localStorage.removeItem("authToken");
          console.warn("Authentication token expired, treating as guest user");
          const wishlistItems = localStorage.getItem("wishlist");
          if (!wishlistItems) return false;

          const wishlist = JSON.parse(
            wishlistItems
          ) as LocalStorageWishlistItem[];
          return wishlist.some((item) => item.productId === productId);
        }
        return false;
      }

      const result = await response.json();
      const products = result.data.products;
      return products.some(
        (product: WishlistProduct) => product.productId === productId
      );
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      return false;
    }
  }

  async updateWishlistProduct(
    request: UpdateWishlistProductRequest
  ): Promise<WishlistProduct> {
    const token = getAuthToken();

    if (!token) {
      // No token = guest user, can't update without authentication
      throw new Error("Authentication required to update wishlist items");
    }

    const response = await fetch(`${this.baseUrl}/wishlist/update`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        console.warn("Authentication token expired");
        throw new Error("Authentication required to update wishlist items");
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to update wishlist product");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Migrate localStorage wishlist to database when user logs in
   * This should be called after successful authentication
   */
  async migrateWishlistToDatabase(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      console.warn("No authentication token found for wishlist migration");
      return;
    }

    try {
      const wishlistItems = localStorage.getItem("wishlist");
      if (!wishlistItems) {
        console.log("No localStorage wishlist items to migrate");
        return;
      }

      const localWishlist = JSON.parse(
        wishlistItems
      ) as LocalStorageWishlistItem[];
      if (localWishlist.length === 0) {
        console.log("Empty localStorage wishlist, nothing to migrate");
        return;
      }

      console.log(
        `Migrating ${localWishlist.length} items from localStorage to database`
      );

      // Add each localStorage item to the database wishlist
      for (const item of localWishlist) {
        try {
          await this.addToWishlist({
            productId: item.productId,
          });
        } catch (error) {
          console.warn(
            `Failed to migrate wishlist item ${item.productId} to database:`,
            error
          );
          // Continue with other items even if one fails
        }
      }

      // Clear localStorage wishlist after successful migration
      localStorage.removeItem("wishlist");
      console.log(
        "Wishlist migration completed, localStorage wishlist cleared"
      );
    } catch (error) {
      console.error("Error migrating wishlist to database:", error);
    }
  }
}

export const WishlistService = new WishlistServices();

// Helper function to get wishlist from backend using localStorage data
async function getWishlistFromBackend(): Promise<WishlistResponse> {
  try {
    const wishlistItems = localStorage.getItem("wishlist");
    if (!wishlistItems) {
      return {
        products: [],
        totalProducts: 0,
        currentPage: 0,
        totalPages: 0,
      };
    }

    const localWishlist = JSON.parse(
      wishlistItems
    ) as LocalStorageWishlistItem[];
    if (localWishlist.length === 0) {
      return {
        products: [],
        totalProducts: 0,
        currentPage: 0,
        totalPages: 0,
      };
    }

    // Prepare request for backend
    const request: ProductsByIdsRequest = {
      productIds: localWishlist.map((item) => item.productId),
    };

    // Fetch product details from backend
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/by-ids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const productsData = data.data as ProductsByIdsResponse;

    // Transform backend response to match wishlist interface
    const wishlistProducts: WishlistProduct[] = productsData.products.map(
      (product, index) => ({
        id: Date.now() + index, // Generate temporary ID
        productId: product.productId,
        productSku: product.productId, // Use productId as SKU since ManyProductsDto doesn't have sku field
        productName: product.productName,
        productImage: product.primaryImage?.imageUrl || null,
        notes: null,
        priority: 1,
        addedAt:
          localWishlist.find((item) => item.productId === product.productId)
            ?.addedAt || new Date().toISOString(),
        inStock: product.stockQuantity > 0,
        availableStock: product.stockQuantity,
        price: product.price || 0,
        finalPrice:
          product.discountedPrice ||
          (product.discountInfo?.active && product.discountInfo?.percentage
            ? product.price * (1 - product.discountInfo.percentage / 100)
            : product.price) ||
          0,
        // Add discount information
        hasActiveDiscount: product.discountInfo?.active || false,
        discountInfo: product.discountInfo
          ? {
              discountId: product.discountInfo.discountId,
              name: product.discountInfo.name,
              percentage: product.discountInfo.percentage,
              startDate: product.discountInfo.startDate,
              endDate: product.discountInfo.endDate,
              active: product.discountInfo.active,
              discountCode: product.discountInfo.discountCode,
            }
          : null,
        compareAtPrice: product.compareAtPrice || null,
      })
    );

    return {
      products: wishlistProducts,
      totalProducts: wishlistProducts.length,
      currentPage: 0,
      totalPages: 1,
    };
  } catch (error) {
    console.error("Error getting wishlist from backend:", error);
    // Fallback to empty wishlist
    return {
      products: [],
      totalProducts: 0,
      currentPage: 0,
      totalPages: 0,
    };
  }
}

// Helper functions for localStorage implementation

function addToLocalStorageWishlist(productId: string): void {
  try {
    const wishlistItems = localStorage.getItem("wishlist");
    const wishlist = wishlistItems
      ? (JSON.parse(wishlistItems) as LocalStorageWishlistItem[])
      : [];

    // Check if item already exists
    const existingItem = wishlist.find((item) => item.productId === productId);
    if (existingItem) {
      console.log("Product already in wishlist");
      return;
    }

    // Create new wishlist item
    const newItem: LocalStorageWishlistItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      addedAt: new Date().toISOString(),
    };

    wishlist.push(newItem);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent("wishlistUpdated"));
  } catch (error) {
    console.error("Error adding to localStorage wishlist:", error);
  }
}

function removeFromLocalStorageWishlist(itemId: string): void {
  try {
    const wishlistItems = localStorage.getItem("wishlist");
    const wishlist = wishlistItems
      ? (JSON.parse(wishlistItems) as LocalStorageWishlistItem[])
      : [];

    const filteredWishlist = wishlist.filter((item) => item.id !== itemId);
    localStorage.setItem("wishlist", JSON.stringify(filteredWishlist));

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent("wishlistUpdated"));
  } catch (error) {
    console.error("Error removing from localStorage wishlist:", error);
  }
}

function removeFromLocalStorageWishlistByProductId(productId: string): void {
  try {
    const wishlistItems = localStorage.getItem("wishlist");
    const wishlist = wishlistItems
      ? (JSON.parse(wishlistItems) as LocalStorageWishlistItem[])
      : [];

    const filteredWishlist = wishlist.filter(
      (item) => item.productId !== productId
    );
    localStorage.setItem("wishlist", JSON.stringify(filteredWishlist));

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent("wishlistUpdated"));
  } catch (error) {
    console.error(
      "Error removing from localStorage wishlist by product ID:",
      error
    );
  }
}
