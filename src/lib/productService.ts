// Product service for fetching products from backend
import { API_ENDPOINTS } from "./api";

// Product DTOs matching the backend
export interface ProductDTO {
  productId: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  basePrice: number;
  salePrice?: number;
  discountedPrice?: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  model?: string;
  slug: string;
  isActive: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  averageRating?: number;
  reviewCount?: number;
  reviews?: ReviewDTO[];
  createdAt: string;
  updatedAt: string;
  images: ProductImageDTO[];
  videos: ProductVideoDTO[];
  variants: ProductVariantDTO[];
  fullDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensionsCm?: string;
  weightKg?: number;
}

export interface ProductImageDTO {
  imageId: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVideoDTO {
  videoId: number;
  url: string;
  title?: string;
  description?: string;
  sortOrder: number;
  durationSeconds?: number;
}

export interface ProductVariantDTO {
  variantId: number;
  variantSku: string;
  variantName?: string;
  variantBarcode?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isInStock?: boolean;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
  images: VariantImageDTO[];
  attributes: VariantAttributeDTO[];
}

export interface VariantImageDTO {
  imageId: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface VariantAttributeDTO {
  attributeValueId: number;
  attributeValue: string;
  attributeTypeId: number;
  attributeType: string;
}

// Backend Category DTO
export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  slug: string;
  url?: string;
}

// Backend Brand DTO
export interface BrandDto {
  brandId: string;
  brandName: string;
  description?: string;
  logoUrl?: string;
}

// Backend Primary Image DTO
export interface PrimaryImageDto {
  id: number;
  imageUrl: string;
  altText?: string;
  title?: string;
  isPrimary: boolean;
  sortOrder: number;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

// Backend Discount Info DTO
export interface DiscountInfoDto {
  discountId: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
}

// For product grid display - updated to match backend response
export interface ManyProductsDto {
  productId: string;
  productName: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  category: CategoryDto;
  brand: BrandDto;
  isBestSeller: boolean;
  isFeatured: boolean;
  discountInfo?: DiscountInfoDto;
  primaryImage?: PrimaryImageDto;
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductSearchDTO {
  // Text search
  name?: string;
  description?: string;
  sku?: string;

  // Price filters (backend expects BigDecimal, send as numbers)
  basePriceMin?: number;
  basePriceMax?: number;
  salePriceMin?: number;
  salePriceMax?: number;

  // Stock filters
  stockQuantityMin?: number;
  stockQuantityMax?: number;
  inStock?: boolean;

  // Category and brand filters
  categoryId?: number;
  categoryIds?: number[];
  categoryNames?: string[];
  brandId?: string;
  brandIds?: string[];
  brandNames?: string[];

  // Feature flags
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;

  // Rating filters
  averageRatingMin?: number;
  averageRatingMax?: number;

  // Discount filters
  hasDiscount?: boolean;
  isOnSale?: boolean;

  // Pagination and sorting
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;

  // Variant attributes
  variantAttributes?: string[]; // e.g., ["Color:Red", "Size:LG"]
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface AddToCartRequest {
  productId?: string;
  variantId?: number;
  quantity: number;
}

export interface ReviewDTO {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  moderatorNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Service for fetching products from backend
 */
export const ProductService = {
  /**
   * Get all products with pagination for product grid
   */
  getAllProducts: async (
    page = 0,
    size = 12,
    sortBy = "createdAt",
    sortDirection = "desc"
  ): Promise<Page<ManyProductsDto>> => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PRODUCTS}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const products: Page<ManyProductsDto> = await response.json();
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Search products with filters
   */
  searchProducts: async (
    searchDTO: ProductSearchDTO
  ): Promise<Page<ManyProductsDto>> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SEARCH_PRODUCTS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchDTO),
      });

      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status}`);
      }

      const searchResults: Page<ManyProductsDto> = await response.json();
      return searchResults;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  /**
   * Get product by ID for detailed view
   */
  getProductById: async (productId: string): Promise<ProductDTO> => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PRODUCT_BY_ID(productId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const product: ProductDTO = await response.json();
      return product;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  },

  /**
   * Get product by slug
   */
  getProductBySlug: async (slug: string): Promise<ProductDTO> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCT_BY_SLUG(slug)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const product: ProductDTO = await response.json();
      return product;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      throw error;
    }
  },

  /**
   * Check if product has variants
   */
  hasVariants: (product: ProductDTO): boolean => {
    return product.variants && product.variants.length > 0;
  },

  /**
   * Add item to cart (this would typically go to a cart service)
   */
  addToCart: async (request: AddToCartRequest): Promise<any> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CART}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if user is logged in
          ...(localStorage.getItem("authToken") && {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          }),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  /**
   * Convert ManyProductsDto to format expected by ProductCard component
   */
  convertToProductCardFormat: (product: ManyProductsDto) => {
    const discountPercentage = product.discountInfo
      ? Math.round(
          (((product.compareAtPrice || product.price) - product.price) /
            (product.compareAtPrice || product.price)) *
            100
        )
      : 0;

    return {
      id: product.productId,
      name: product.productName,
      price: product.price,
      originalPrice: product.compareAtPrice || undefined,
      rating: product.averageRating || 0, // Use actual rating from backend
      reviewCount: product.reviewCount || 0, // Use actual review count from backend
      image: product.primaryImage?.imageUrl || "/placeholder-product.jpg",
      discount: discountPercentage > 0 ? discountPercentage : undefined,
      isNew: false, // Could be calculated based on creation date
      isBestseller: product.isBestSeller,
      discountedPrice: product.price,
    };
  },

  /**
   * Get product reviews with pagination
   */
  getProductReviews: async (
    productId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDirection: string = "desc"
  ): Promise<{
    data: ReviewDTO[];
    pagination: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    };
  }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      const response = await fetch(
        `${API_ENDPOINTS.PRODUCT_REVIEWS(productId)}?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product reviews: ${response.status}`);
      }

      const result = await response.json();
      return {
        data: result.data || [],
        pagination: result.pagination || {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  },
};

export default ProductService;
