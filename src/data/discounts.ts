// Placeholder discount data - should be replaced with real backend service

export interface Discount {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  bannerImage?: string;
  categories?: string[];
}

// Mock data for now
export const getActiveDiscounts = (): Discount[] => {
  return [
    {
      id: "1",
      title: "Summer Sale",
      description: "Get up to 50% off on summer collection",
      discountPercentage: 50,
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      isActive: true,
      categories: ["Fashion", "Electronics"],
    },
  ];
};

export const getUpcomingDiscounts = (): Discount[] => {
  return [];
};

export const getDiscountById = (id: string): Discount | null => {
  const discounts = getActiveDiscounts();
  return discounts.find((d) => d.id === id) || null;
};

export const getDiscountProducts = (discountId: string) => {
  // Return empty array for now - should fetch from backend
  return [];
};
