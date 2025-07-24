import { allProducts } from './products';

export interface Discount {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  code?: string;
  bannerImage: string;
  bannerColor: string;
  categories?: string[];
  productIds?: string[];
  minPurchase?: number;
  isActive: boolean;
  isExpired?: boolean;
  isFlashSale?: boolean;
}

// Helper function to create dates relative to current date
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const discounts: Discount[] = [
  {
    id: "summer-sale-2023",
    title: "Summer Sale",
    description: "Get up to 20% off on select summer essentials. Limited time offer!",
    discountPercentage: 20,
    startDate: daysFromNow(-7),
    endDate: daysFromNow(7),
    bannerImage: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800",
    bannerColor: "from-blue-600 to-blue-400",
    categories: ["Fashion", "Accessories"],
    isActive: true,
    isFlashSale: false
  },
  {
    id: "flash-deal-electronics",
    title: "Flash Deal: Electronics",
    description: "24-hour flash sale! Get incredible discounts on electronics. Hurry before time runs out!",
    discountPercentage: 25,
    startDate: new Date(),
    endDate: daysFromNow(1),
    bannerImage: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800",
    bannerColor: "from-red-600 to-orange-400",
    categories: ["Electronics", "Headphones", "Smartphones"],
    isActive: true,
    isFlashSale: true
  },
  {
    id: "new-user-discount",
    title: "New User Special",
    description: "First-time customers get 15% off their first order with code WELCOME15.",
    discountPercentage: 15,
    startDate: daysFromNow(-30),
    endDate: daysFromNow(60),
    code: "WELCOME15",
    bannerImage: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800",
    bannerColor: "from-green-600 to-teal-400",
    isActive: true,
    isFlashSale: false
  },
  {
    id: "clearance-home-garden",
    title: "Home & Garden Clearance",
    description: "End of season clearance on home and garden products. Save up to 30% while supplies last.",
    discountPercentage: 30,
    startDate: daysFromNow(-15),
    endDate: daysFromNow(15),
    bannerImage: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800",
    bannerColor: "from-amber-600 to-yellow-400",
    categories: ["Home & Garden"],
    isActive: true,
    isFlashSale: false
  },
  {
    id: "premium-headphones",
    title: "Premium Headphones Sale",
    description: "Exclusive discount on our premium headphones collection. Superior sound quality for less.",
    discountPercentage: 15,
    startDate: daysFromNow(-10),
    endDate: daysFromNow(5),
    bannerImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    bannerColor: "from-purple-600 to-indigo-400",
    categories: ["Electronics", "Headphones"],
    productIds: ["1", "8"],
    isActive: true,
    isFlashSale: false
  },
  {
    id: "back-to-school",
    title: "Back to School",
    description: "Get ready for the new school year with discounts on backpacks, electronics, and more.",
    discountPercentage: 12,
    startDate: daysFromNow(15),
    endDate: daysFromNow(45),
    bannerImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    bannerColor: "from-indigo-600 to-violet-400",
    categories: ["Electronics", "Laptops", "Accessories"],
    isActive: true,
    isFlashSale: false
  },
  {
    id: "weekend-special",
    title: "Weekend Special",
    description: "Limited time weekend offers on selected products. No code required, discount applied at checkout.",
    discountPercentage: 10,
    startDate: daysFromNow(2),
    endDate: daysFromNow(4),
    bannerImage: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800",
    bannerColor: "from-rose-600 to-pink-400",
    isActive: true,
    isFlashSale: true
  }
];

// Helper function to get products for a specific discount
export const getDiscountProducts = (discount: Discount) => {
  let filteredProducts = [...allProducts];
  
  // Filter by category
  if (discount.categories && discount.categories.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      product.categories?.some(category => 
        discount.categories?.includes(category)
      )
    );
  }
  
  // Filter by specific product IDs
  if (discount.productIds && discount.productIds.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      discount.productIds?.includes(product.id)
    );
  }
  
  // Calculate discount price for each product
  return filteredProducts.map(product => ({
    ...product,
    discountedPrice: product.originalPrice 
      ? Math.round((product.originalPrice - (product.originalPrice * discount.discountPercentage / 100)) * 100) / 100
      : Math.round((product.price - (product.price * discount.discountPercentage / 100)) * 100) / 100,
    appliedDiscountPercentage: discount.discountPercentage
  }));
};

// Get a specific discount by ID
export const getDiscountById = (id: string): Discount | undefined => {
  return discounts.find(discount => discount.id === id);
};

// Get all active discounts
export const getActiveDiscounts = (): Discount[] => {
  const now = new Date();
  return discounts
    .filter(discount => 
      discount.isActive && 
      discount.startDate <= now && 
      discount.endDate >= now
    )
    .map(discount => ({
      ...discount,
      isExpired: false
    }));
};

// Get upcoming discounts
export const getUpcomingDiscounts = (): Discount[] => {
  const now = new Date();
  return discounts
    .filter(discount => 
      discount.isActive && 
      discount.startDate > now
    )
    .map(discount => ({
      ...discount,
      isExpired: false
    }));
};

export default discounts; 