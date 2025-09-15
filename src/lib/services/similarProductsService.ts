import { API_ENDPOINTS, getAuthHeaders } from "../api";
import { ManyProductsDto } from "../productService";

export interface SimilarProductsRequest {
  productId: string;
  page?: number;
  size?: number;
  includeOutOfStock?: boolean;
  algorithm?: "brand" | "category" | "keywords" | "popular" | "mixed";
}

export interface SimilarProductsResponse {
  success: boolean;
  data: {
    content: ManyProductsDto[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
}

class SimilarProductsService {
  async getSimilarProducts(
    request: SimilarProductsRequest
  ): Promise<SimilarProductsResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/similar`, {
        method: "GET",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: request.productId,
          page: request.page || 0,
          size: request.size || 12,
          includeOutOfStock: request.includeOutOfStock || false,
          algorithm: request.algorithm || "mixed",
        }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching similar products:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch similar products"
      );
    }
  }

  async getSimilarProductsByProductId(
    productId: string,
    options: {
      page?: number;
      size?: number;
      includeOutOfStock?: boolean;
      algorithm?: "brand" | "category" | "keywords" | "popular" | "mixed";
    } = {}
  ): Promise<SimilarProductsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || 0));
      params.append("size", String(options.size || 12));
      params.append(
        "includeOutOfStock",
        String(options.includeOutOfStock || false)
      );
      params.append("algorithm", options.algorithm || "mixed");

      const response = await fetch(
        `${API_ENDPOINTS.PRODUCTS}/${productId}/similar?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching similar products by product ID:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch similar products"
      );
    }
  }
}

export const similarProductsService = new SimilarProductsService();
