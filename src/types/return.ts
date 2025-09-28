export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  product: {
    productId: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
  };
  variant?: {
    productId: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  price: number;
  totalPrice: number;
  
  // Return eligibility fields
  maxReturnDays: number;
  deliveredAt?: string;
  isReturnEligible: boolean;
  daysRemainingForReturn: number;
}

export interface OrderDetails {
  id: string;
  userId?: string;
  orderNumber: string;
  pickupToken?: string;
  pickupTokenUsed?: boolean;
  status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  orderItemId: string;
  returnQuantity: number;
  itemReason: string;
}

export interface SubmitReturnRequest {
  customerId: string;
  orderId: string;
  reason: string;
  returnItems: ReturnItem[];
}

export interface SubmitGuestReturnRequest {
  orderNumber: string;
  pickupToken: string;
  reason: string;
  returnItems: ReturnItem[];
}

export interface ReturnRequestResponse {
  id: string;
  orderId: string;
  customerId?: string;
  reason: string;
  status: string;
  submittedAt: string;
  decisionAt?: string;
  decisionNotes?: string;
  returnItems: {
    id: string;
    orderItemId: string;
    quantity: number;
    reason: string;
  }[];
  returnMedia?: {
    id: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  }[];
}
