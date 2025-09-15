import { API_ENDPOINTS, getAuthHeaders } from "../api";

export interface ReviewDTO {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  moderatorNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateReviewDTO {
  productId: string;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewDTO {
  reviewId: number;
  rating?: number;
  title?: string;
  content?: string;
}

export interface ReviewSearchDTO {
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  status?: string;
  isVerifiedPurchase?: boolean;
  keyword?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: ReviewDTO;
}

export interface ReviewListResponse {
  success: boolean;
  message: string;
  data: ReviewDTO[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ReviewStatsResponse {
  success: boolean;
  message: string;
  data: {
    averageRating: number;
    reviewCount: number;
    ratingDistribution: Array<[number, number]>;
  };
}

class ReviewService {
  async createReview(reviewData: CreateReviewDTO): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.REVIEWS}/create`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different error response formats
        if (responseData.errors) {
          // Validation errors with field-specific messages
          const errorMessages = Object.entries(responseData.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          throw new Error(errorMessages);
        } else if (responseData.message) {
          // General error message
          throw new Error(responseData.message);
        } else {
          throw new Error("Failed to create review");
        }
      }

      return responseData;
    } catch (error: any) {
      console.error("Error creating review:", error);
      throw new Error(error.message || "Failed to create review");
    }
  }

  async updateReview(reviewData: UpdateReviewDTO): Promise<ReviewResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.REVIEWS}/update`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update review");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error updating review:", error);
      throw new Error(error.message || "Failed to update review");
    }
  }

  async deleteReview(
    reviewId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.REVIEWS}/${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete review");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      throw new Error(error.message || "Failed to delete review");
    }
  }

  async getProductReviews(
    productId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDirection: string = "desc"
  ): Promise<ReviewListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      const response = await fetch(
        `${API_ENDPOINTS.REVIEWS}/product/${productId}?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reviews");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching product reviews:", error);
      throw new Error(error.message || "Failed to fetch reviews");
    }
  }

  async getProductReviewStats(productId: string): Promise<ReviewStatsResponse> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.REVIEWS}/product/${productId}/stats`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch review stats");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching review stats:", error);
      throw new Error(error.message || "Failed to fetch review stats");
    }
  }

  async getUserReviews(
    page: number = 0,
    size: number = 10
  ): Promise<ReviewListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await fetch(
        `${API_ENDPOINTS.REVIEWS}/user?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user reviews");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching user reviews:", error);
      throw new Error(error.message || "Failed to fetch user reviews");
    }
  }

  async voteReview(
    reviewId: number,
    isHelpful: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const params = new URLSearchParams({
        isHelpful: isHelpful.toString(),
      });

      const response = await fetch(
        `${API_ENDPOINTS.REVIEWS}/${reviewId}/vote?${params.toString()}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to vote on review");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error voting on review:", error);
      throw new Error(error.message || "Failed to vote on review");
    }
  }
}

export const reviewService = new ReviewService();
