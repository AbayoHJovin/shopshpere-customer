import { API_ENDPOINTS } from "./api";

export interface LandingPageProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  discount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isInStock?: boolean;
  brand?: string;
  category?: string;
  discountEndDate?: string;
  discountName?: string;
  hasActiveDiscount?: boolean;
  hasVariantDiscounts?: boolean;
  maxVariantDiscount?: number;
  discountedVariantsCount?: number;
}

export interface LandingPageData {
  topSellingProducts: LandingPageProduct[];
  newProducts: LandingPageProduct[];
  discountedProducts: LandingPageProduct[];
  popularCategories: Array<{
    id: number;
    name: string;
    productCount: number;
    image: string;
  }>;
  popularBrands: Array<{
    id: string;
    name: string;
    productCount: number;
    image: string;
  }>;
}

class LandingPageService {
  async fetchLandingPageData(): Promise<LandingPageData> {
    try {
      const response = await fetch(API_ENDPOINTS.LANDING_PAGE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch landing page data: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        return this.transformBackendData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch landing page data");
      }
    } catch (error) {
      console.error("Error fetching landing page data:", error);
      throw error; // Re-throw the error instead of returning fallback data
    }
  }

  private transformBackendData(backendData: any): LandingPageData {
    return {
      topSellingProducts:
        backendData.topSellingProducts?.map(this.transformProduct) || [],
      newProducts: backendData.newProducts?.map(this.transformProduct) || [],
      discountedProducts:
        backendData.discountedProducts?.map(this.transformProduct) || [],
      popularCategories:
        backendData.popularCategories?.map(this.transformCategory) || [],
      popularBrands: backendData.popularBrands?.map(this.transformBrand) || [],
    };
  }

  private transformProduct(product: any): LandingPageProduct {
    return {
      id: product.productId,
      name: product.productName,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
      image: product.primaryImageUrl || "https://via.placeholder.com/400x400",
      discount: product.discountPercentage
        ? Math.round(product.discountPercentage)
        : undefined,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      isInStock: product.isInStock,
      brand: product.brandName,
      category: product.categoryName,
      discountEndDate: product.discountEndDate,
      discountName: product.discountName,
      hasActiveDiscount: product.hasActiveDiscount,
      hasVariantDiscounts: product.hasVariantDiscounts,
      maxVariantDiscount: product.maxVariantDiscount,
      discountedVariantsCount: product.discountedVariantsCount,
    };
  }

  private transformCategory(category: any): {
    id: number;
    name: string;
    productCount: number;
    image: string;
  } {
    return {
      id: category.categoryId,
      name: category.categoryName,
      productCount: category.productCount || 0,
      image:
        category.imageUrl ||
        `https://via.placeholder.com/400x300/${
          category.displayColor?.replace("#", "") || "cccccc"
        }/ffffff?text=${encodeURIComponent(category.categoryName)}`,
    };
  }

  private transformBrand(brand: any): {
    id: string;
    name: string;
    productCount: number;
    image: string;
  } {
    return {
      id: brand.brandId,
      name: brand.brandName,
      productCount: brand.productCount || 0,
      image:
        brand.logoUrl ||
        `https://via.placeholder.com/400x300/${
          brand.displayColor?.replace("#", "") || "cccccc"
        }/ffffff?text=${encodeURIComponent(brand.brandName)}`,
    };
  }
}

export const landingPageService = new LandingPageService();
export default landingPageService;
