import { API_BASE_URL, getAuthHeaders } from "../api";

export interface OrderActivity {
  id: number;
  orderId: number;
  activityType: string;
  title: string;
  description: string;
  timestamp: string;
  actorType: string;
  actorId: string | null;
  actorName: string | null;
  metadata: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

export interface OrderActivitiesResponse {
  orderId: number;
  totalActivities: number;
  activities: OrderActivity[];
}

class OrderActivitiesService {
  /**
   * Get order activity timeline for authenticated users
   */
  async getOrderActivities(orderId: string | number): Promise<OrderActivitiesResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/activity-logs`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized access");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching order activities:", error);
      throw new Error(error.message || "Failed to fetch order activities");
    }
  }

  /**
   * Get order activity timeline for guest users with tracking token
   */
  async getOrderActivitiesWithToken(
    orderId: string | number,
    token: string
  ): Promise<OrderActivitiesResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/activity-logs/public?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        if (response.status === 401) {
          throw new Error("Invalid or expired tracking token");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching order activities with token:", error);
      throw new Error(error.message || "Failed to fetch order activities");
    }
  }

  /**
   * Get recent activities for an order
   */
  async getRecentActivities(
    orderId: string | number,
    limit: number = 10
  ): Promise<OrderActivitiesResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/activity-logs/recent?limit=${limit}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching recent activities:", error);
      throw new Error(error.message || "Failed to fetch recent activities");
    }
  }

  /**
   * Get activity count for an order
   */
  async getActivityCount(orderId: string | number): Promise<number> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/activity-logs/count`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.totalActivities || 0;
    } catch (error: any) {
      console.error("Error fetching activity count:", error);
      throw new Error(error.message || "Failed to fetch activity count");
    }
  }
}

export const orderActivitiesService = new OrderActivitiesService();
