// Product service for fetching products from backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Product DTOs matching the backend
export interface ProductDTO {
  productId: string;
  name: string;
  description?: string;
  slug: string;
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  sku: string;
  stockQuantity: number;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  brandId: string;
  brandName: string;
  gender: string;
  tags: string[];
  images: ProductImageDTO[];
  videos: ProductVideoDTO[];
  variants: ProductVariantDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageDTO {
  imageId: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVideoDTO {
  videoId: number;
  videoUrl: string;
  title?: string;
  duration?: number;
  sortOrder: number;
}

export interface ProductVariantDTO {
  variantId: number;
  variantSku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  weight?: number;
  dimensions?: string;
  images: VariantImageDTO[];
  attributes: VariantAttributeDTO[];
}

export interface VariantImageDTO {
  imageId: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface VariantAttributeDTO {
  attributeValueId: number;
  attributeTypeName: string;
  attributeValue: string;
}

// For product grid display
export interface ManyProductsDto {
  productId: string;
  name: string;
  slug: string;
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  isActive: boolean;
  categoryName: string;
  brandName: string;
  gender: string;
  primaryImageUrl?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductSearchDTO {
  query?: string;
  categoryIds?: number[];
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  tags?: string[];
  inStock?: boolean;
  minRating?: number;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
  attributes?: Record<string, string[]>; // attributeTypeName -> [values]
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
        `${API_BASE_URL}/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
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
      const response = await fetch(`${API_BASE_URL}/products/search`, {
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
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
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
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  },

  /**
   * Get product by slug
   */
  getProductBySlug: async (slug: string): Promise<ProductDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
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
      const response = await fetch(`${API_BASE_URL}/cart`, {
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
  convertToProductCardFormat: (product: ManyProductsDto) => ({
    id: product.productId,
    name: product.name,
    price: product.finalPrice,
    originalPrice: product.basePrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: product.primaryImageUrl || "/placeholder-product.jpg",
    discount: product.discountPercentage,
    isNew: false, // Could be calculated based on createdAt
    isBestseller: false, // Could be based on some criteria
    discountedPrice: product.finalPrice,
  }),
};

export default ProductService;
