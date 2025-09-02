// Simple Stripe service for checkout integration
// This service handles the basic Stripe checkout flow without requiring the full Stripe SDK

export interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  customer_email?: string;
  amount_total: number;
  currency: string;
}

export interface StripePaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  client_secret: string;
}

export const StripeService = {
  /**
   * Create a checkout session (handled by backend)
   * This is just a placeholder - the actual session creation happens in the backend
   */
  createCheckoutSession: async (
    items: any[],
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession> => {
    // This would typically call your backend API to create a Stripe session
    // For now, we'll return a mock response
    return {
      id: `cs_test_${Date.now()}`,
      url: `${successUrl}?session_id=cs_test_${Date.now()}`,
      payment_status: "paid",
      customer_email: "test@example.com",
      amount_total: 2000, // $20.00 in cents
      currency: "usd",
    };
  },

  /**
   * Verify a checkout session (handled by backend)
   * This is just a placeholder - the actual verification happens in the backend
   */
  verifyCheckoutSession: async (
    sessionId: string
  ): Promise<StripeCheckoutSession> => {
    // This would typically call your backend API to verify the session
    // For now, we'll return a mock response
    return {
      id: sessionId,
      url: "",
      payment_status: "paid",
      customer_email: "test@example.com",
      amount_total: 2000,
      currency: "usd",
    };
  },

  /**
   * Get Stripe publishable key from environment
   */
  getPublishableKey: (): string => {
    return (
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
    );
  },

  /**
   * Format amount for Stripe (convert dollars to cents)
   */
  formatAmountForStripe: (amount: number): number => {
    return Math.round(amount * 100);
  },

  /**
   * Format amount from Stripe (convert cents to dollars)
   */
  formatAmountFromStripe: (amount: number): number => {
    return amount / 100;
  },
};

// Stripe Elements configuration (for future use)
export const stripeElementsOptions = {
  mode: "payment" as const,
  currency: "usd",
  appearance: {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "Ideal Sans, system-ui, sans-serif",
      spacingUnit: "2px",
      borderRadius: "4px",
    },
  },
};

