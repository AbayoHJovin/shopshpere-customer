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

class WishlistServices {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async addToWishlist(request: AddToWishlistRequest): Promise<WishlistProduct> {
    const response = await fetch(`${this.baseUrl}/wishlist/add`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
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
    const response = await fetch(
      `${this.baseUrl}/wishlist/view?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
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

  async removeFromWishlist(wishlistProductId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/wishlist/remove/${wishlistProductId}`,
      {
        method: "DELETE",
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove from wishlist");
    }
  }

  async clearWishlist(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/wishlist/clear`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to clear wishlist");
    }
  }

  async moveToCart(
    wishlistProductId: number,
    quantity: number = 1
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/wishlist/move-to-cart/${wishlistProductId}?quantity=${quantity}`,
      {
        method: "POST",
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to move to cart");
    }
  }

  async isInWishlist(productId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/wishlist/view?page=0&size=1000`,
        {
          method: "GET",
          headers: await this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
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
    const response = await fetch(`${this.baseUrl}/wishlist/update`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update wishlist product");
    }

    const result = await response.json();
    return result.data;
  }
}

export const WishlistService = new WishlistServices();
