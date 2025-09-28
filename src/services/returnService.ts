import { OrderDetails, SubmitReturnRequest, SubmitGuestReturnRequest, ReturnRequestResponse } from '@/types/return';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export class ReturnService {
  /**
   * Get order details by pickup token (for guest users)
   */
  static async getOrderByPickupToken(pickupToken: string): Promise<OrderDetails> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/track/token/${pickupToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch order details');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get order details by order number (public endpoint)
   */
  static async getOrderByOrderNumber(orderNumber: string): Promise<OrderDetails> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/track/${orderNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch order details');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Submit return request for authenticated users
   */
  static async submitReturnRequest(
    returnRequest: SubmitReturnRequest,
    mediaFiles?: File[]
  ): Promise<ReturnRequestResponse> {
    const formData = new FormData();
    
    // Add return request data as JSON blob with correct content type
    const returnRequestBlob = new Blob([JSON.stringify(returnRequest)], {
      type: 'application/json'
    });
    formData.append('returnRequest', returnRequestBlob);
    
    // Add media files if provided
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append('mediaFiles', file);
      });
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/returns/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit return request');
    }

    return await response.json();
  }

  /**
   * Submit return request for guest users
   */
  static async submitGuestReturnRequest(
    returnRequest: SubmitGuestReturnRequest,
    mediaFiles?: File[]
  ): Promise<ReturnRequestResponse> {
    const formData = new FormData();
    
    // Add return request data as JSON blob with correct content type
    const returnRequestBlob = new Blob([JSON.stringify(returnRequest)], {
      type: 'application/json'
    });
    formData.append('returnRequest', returnRequestBlob);
    
    // Add media files if provided
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append('mediaFiles', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/returns/submit/guest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit return request');
    }

    return await response.json();
  }

  /**
   * Get customer's return requests (authenticated users only)
   */
  static async getCustomerReturnRequests(customerId: string, page = 0, size = 10): Promise<{
    content: ReturnRequestResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_BASE_URL}/api/v1/returns/my-returns?customerId=${customerId}&page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch return requests');
    }

    return await response.json();
  }

  /**
   * Get return request details by ID
   */
  static async getReturnRequestDetails(returnRequestId: string): Promise<ReturnRequestResponse> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/returns/${returnRequestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch return request details');
    }

    return await response.json();
  }

  /**
   * Validate media files before upload
   */
  static validateMediaFiles(files: File[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxImages = 5;
    const maxVideos = 1;
    const maxVideoSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov'];

    let imageCount = 0;
    let videoCount = 0;

    for (const file of files) {
      if (allowedImageTypes.includes(file.type)) {
        imageCount++;
        if (file.size > maxImageSize) {
          errors.push(`Image ${file.name} is too large. Maximum size is 10MB.`);
        }
      } else if (allowedVideoTypes.includes(file.type)) {
        videoCount++;
        if (file.size > maxVideoSize) {
          errors.push(`Video ${file.name} is too large. Maximum size is 50MB.`);
        }
      } else {
        errors.push(`File ${file.name} has unsupported format.`);
      }
    }

    if (imageCount > maxImages) {
      errors.push(`Too many images. Maximum ${maxImages} images allowed.`);
    }

    if (videoCount > maxVideos) {
      errors.push(`Too many videos. Maximum ${maxVideos} video allowed.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
