import { API_ENDPOINTS, getAuthHeaders } from "../api";

export interface PointsPaymentPreview {
  totalAmount: number;
  availablePoints: number;
  pointsValue: number;
  remainingToPay: number;
  canPayWithPointsOnly: boolean;
  pointValue: number;
}

export interface PointsPaymentRequest {
  userId: string;
  items: Array<{
    productId: string;
    variantId?: number;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  useAllAvailablePoints: boolean;
}

export interface PointsPaymentResult {
  success: boolean;
  message: string;
  orderId?: number;
  orderNumber?: string;
  pointsUsed: number;
  pointsValue: number;
  remainingAmount: number;
  stripeSessionId?: string; // Contains the complete Stripe checkout URL for redirection
  hybridPayment: boolean;
}

class PointsPaymentService {
  async previewPointsPayment(request: PointsPaymentRequest): Promise<PointsPaymentPreview> {
    try {
      console.log('Making points payment preview request to:', API_ENDPOINTS.POINTS_PAYMENT_PREVIEW);
      console.log('Request payload:', request);

      const response = await fetch(API_ENDPOINTS.POINTS_PAYMENT_PREVIEW, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      console.log('Points payment preview response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Points payment preview error response:', errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid request data. Please check your cart and address information.');
        } else if (response.status === 401) {
          throw new Error('Please log in to use points payment.');
        } else if (response.status === 404) {
          throw new Error('User not found or insufficient points.');
        } else {
          throw new Error(`Failed to preview points payment: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Points payment preview result:', result);
      return result;
    } catch (error) {
      console.error('Error in previewPointsPayment:', error);
      throw error;
    }
  }

  async processPointsPayment(request: PointsPaymentRequest): Promise<PointsPaymentResult> {
    try {
      console.log('Making points payment process request to:', API_ENDPOINTS.POINTS_PAYMENT_PROCESS);
      console.log('Request payload:', request);

      const response = await fetch(API_ENDPOINTS.POINTS_PAYMENT_PROCESS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      console.log('Points payment process response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Points payment process error response:', errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid payment request. Please check your cart and address information.');
        } else if (response.status === 401) {
          throw new Error('Please log in to process payment.');
        } else if (response.status === 402) {
          throw new Error('Insufficient points or payment required.');
        } else if (response.status === 409) {
          throw new Error('Some items in your cart are no longer available.');
        } else {
          throw new Error(`Failed to process points payment: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Points payment process result:', result);
      return result;
    } catch (error) {
      console.error('Error in processPointsPayment:', error);
      throw error;
    }
  }

  async completeHybridPayment(userId: string, orderId: string, stripeSessionId: string): Promise<PointsPaymentResult> {
    try {
      const endpoint = `${API_ENDPOINTS.POINTS_PAYMENT_COMPLETE_HYBRID(userId, orderId)}?stripeSessionId=${encodeURIComponent(stripeSessionId)}`;
      console.log('Making hybrid payment completion request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      console.log('Hybrid payment completion response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hybrid payment completion error response:', errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid payment completion request.');
        } else if (response.status === 401) {
          throw new Error('Please log in to complete payment.');
        } else if (response.status === 404) {
          throw new Error('Order not found or already completed.');
        } else {
          throw new Error(`Failed to complete hybrid payment: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Hybrid payment completion result:', result);
      return result;
    } catch (error) {
      console.error('Error in completeHybridPayment:', error);
      throw error;
    }
  }
}

export const pointsPaymentService = new PointsPaymentService();
