// Types based on backend DTOs
export interface OrderCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  items: OrderItemRequest[];
  orderCode?: string; // Optional - for guest users
  notes?: string;
  totalAmount: number;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  price: number;
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

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Service to interact with the Order API
 */
export const OrderService = {
  /**
   * Create an order for an authenticated user
   */
  createOrder: async (request: OrderCreateRequest): Promise<OrderResponse> => {
    try {
      // In real implementation, we would make API call with authentication
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Create an order for a guest user
   */
  createGuestOrder: async (request: OrderCreateRequest): Promise<OrderResponse> => {
    try {
      // In real implementation, we would make API call without authentication
      const response = await fetch(`${API_BASE_URL}/guest/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating guest order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating guest order:', error);
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
      'United States',
      'Canada',
      'United Kingdom',
      'Australia',
      'Germany',
      'France',
      'Spain',
      'Italy',
      'Japan',
      'China',
      'India',
      'Brazil',
      'South Africa',
      'Nigeria',
      'Kenya',
      'Ghana',
      'Rwanda'
    ];
  }
}; 