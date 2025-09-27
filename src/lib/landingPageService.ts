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

export interface CategoryWithProducts {
  id: number;
  name: string;
  description?: string;
  image: string;
  slug: string;
  productCount: number;
  isActive: boolean;
  isFeatured: boolean;
  products: LandingPageProduct[];
}

export interface BrandWithProducts {
  id: string;
  name: string;
  description?: string;
  image: string;
  slug: string;
  productCount: number;
  isActive: boolean;
  isFeatured: boolean;
  products: LandingPageProduct[];
}

export interface LandingPageData {
  topSellingProducts: LandingPageProduct[];
  newProducts: LandingPageProduct[];
  discountedProducts: LandingPageProduct[];
  featuredCategories: CategoryWithProducts[];
  featuredBrands: BrandWithProducts[];
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
        backendData.topSellingProducts?.map((product: any) => this.transformProduct(product)) || [],
      newProducts: backendData.newProducts?.map((product: any) => this.transformProduct(product)) || [],
      discountedProducts:
        backendData.discountedProducts?.map((product: any) => this.transformProduct(product)) || [],
      featuredCategories:
        backendData.featuredCategories?.map((category: any) => this.transformCategoryWithProducts(category)) || [],
      featuredBrands: backendData.featuredBrands?.map((brand: any) => this.transformBrandWithProducts(brand)) || [],
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

  private transformCategoryWithProducts(category: any): CategoryWithProducts {
    return {
      id: category.categoryId,
      name: category.categoryName,
      description: category.description,
      image: category.imageUrl || `https://via.placeholder.com/400x300/cccccc/ffffff?text=${encodeURIComponent(category.categoryName)}`,
      slug: category.slug,
      productCount: category.productCount || 0,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      products: category.products?.map((product: any) => this.transformProduct(product)) || [],
    };
  }

  private transformBrandWithProducts(brand: any): BrandWithProducts {
    return {
      id: brand.brandId,
      name: brand.brandName,
      description: brand.description,
      image: brand.logoUrl || `https://via.placeholder.com/400x300/cccccc/ffffff?text=${encodeURIComponent(brand.brandName)}`,
      slug: brand.slug,
      productCount: brand.productCount || 0,
      isActive: brand.isActive,
      isFeatured: brand.isFeatured,
      products: brand.products?.map((product: any) => this.transformProduct(product)) || [],
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
