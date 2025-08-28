// Filter service for fetching filter options from backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// DTOs based on backend responses
export interface CategoryDTO {
  categoryId: number;
  name: string;
  description?: string;
  parentId?: number;
  subcategories?: CategoryDTO[];
  productCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDTO {
  brandId: string;
  brandName: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  logoUrl?: string;
  websiteUrl?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeTypeDTO {
  attributeTypeId: number;
  name: string;
  description?: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeValueDTO {
  attributeValueId: number;
  value: string;
  attributeTypeId: number;
  attributeTypeName?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
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

export interface FilterOptions {
  categories: CategoryDTO[];
  brands: BrandDTO[];
  attributes: {
    type: ProductAttributeTypeDTO;
    values: ProductAttributeValueDTO[];
  }[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface FilterError {
  type: "categories" | "brands" | "attributes" | "general";
  message: string;
  originalError?: any;
}

/**
 * Service for fetching filter options from backend
 */
export const FilterService = {
  /**
   * Fetch all filter options in parallel
   */
  fetchAllFilterOptions: async (): Promise<{
    data: FilterOptions | null;
    errors: FilterError[];
  }> => {
    const errors: FilterError[] = [];
    let categories: CategoryDTO[] = [];
    let brands: BrandDTO[] = [];
    let attributes: {
      type: ProductAttributeTypeDTO;
      values: ProductAttributeValueDTO[];
    }[] = [];

    // Fetch all data in parallel for better performance
    const results = await Promise.allSettled([
      FilterService.fetchHierarchicalCategories(),
      FilterService.fetchActiveBrands(),
      FilterService.fetchAttributesWithValues(),
    ]);

    // Process categories result
    if (results[0].status === "fulfilled") {
      categories = results[0].value;
    } else {
      errors.push({
        type: "categories",
        message: "Failed to fetch categories",
        originalError: results[0].reason,
      });
    }

    // Process brands result
    if (results[1].status === "fulfilled") {
      brands = results[1].value;
    } else {
      errors.push({
        type: "brands",
        message: "Failed to fetch brands",
        originalError: results[1].reason,
      });
    }

    // Process attributes result
    if (results[2].status === "fulfilled") {
      attributes = results[2].value;
    } else {
      errors.push({
        type: "attributes",
        message: "Failed to fetch product attributes",
        originalError: results[2].reason,
      });
    }

    // Build filter options
    const filterOptions: FilterOptions = {
      categories,
      brands,
      attributes,
      priceRange: {
        min: 0,
        max: 2000, // Default max, could be dynamic based on products
      },
    };

    return {
      data: errors.length === 3 ? null : filterOptions, // Only return null if all failed
      errors,
    };
  },

  /**
   * Fetch hierarchical categories (top-level with subcategories)
   */
  fetchHierarchicalCategories: async (): Promise<CategoryDTO[]> => {
    try {
      // First get top-level categories
      const topLevelResponse = await fetch(
        `${API_BASE_URL}/categories/top-level`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!topLevelResponse.ok) {
        throw new Error(
          `Failed to fetch top-level categories: ${topLevelResponse.status}`
        );
      }

      const topLevelCategories: CategoryDTO[] = await topLevelResponse.json();

      // Fetch subcategories for each top-level category
      const categoriesWithSubcategories = await Promise.all(
        topLevelCategories.map(async (category) => {
          try {
            const subcategoriesResponse = await fetch(
              `${API_BASE_URL}/categories/sub-categories/${category.categoryId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (subcategoriesResponse.ok) {
              const subcategories: CategoryDTO[] =
                await subcategoriesResponse.json();
              return {
                ...category,
                subcategories,
              };
            } else {
              // If subcategories fail to load, just return the category without subcategories
              console.warn(
                `Failed to fetch subcategories for ${category.name}`
              );
              return category;
            }
          } catch (error) {
            console.warn(
              `Error fetching subcategories for ${category.name}:`,
              error
            );
            return category;
          }
        })
      );

      return categoriesWithSubcategories;
    } catch (error) {
      console.error("Error fetching hierarchical categories:", error);
      throw error;
    }
  },

  /**
   * Fetch active brands
   */
  fetchActiveBrands: async (): Promise<BrandDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/active`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch active brands: ${response.status}`);
      }

      const brands: BrandDTO[] = await response.json();
      return brands;
    } catch (error) {
      console.error("Error fetching active brands:", error);
      throw error;
    }
  },

  /**
   * Fetch all attributes with their values
   */
  fetchAttributesWithValues: async (): Promise<
    {
      type: ProductAttributeTypeDTO;
      values: ProductAttributeValueDTO[];
    }[]
  > => {
    try {
      // First get all attribute types
      const typesResponse = await fetch(
        `${API_BASE_URL}/product-attribute-types`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!typesResponse.ok) {
        throw new Error(
          `Failed to fetch attribute types: ${typesResponse.status}`
        );
      }

      const attributeTypes: ProductAttributeTypeDTO[] =
        await typesResponse.json();

      // Fetch values for each attribute type
      const attributesWithValues = await Promise.all(
        attributeTypes.map(async (type) => {
          try {
            const valuesResponse = await fetch(
              `${API_BASE_URL}/product-attribute-values/type/${type.attributeTypeId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (valuesResponse.ok) {
              const values: ProductAttributeValueDTO[] =
                await valuesResponse.json();
              return {
                type,
                values,
              };
            } else {
              // If values fail to load, return type with empty values
              console.warn(
                `Failed to fetch values for attribute type ${type.name}`
              );
              return {
                type,
                values: [],
              };
            }
          } catch (error) {
            console.warn(
              `Error fetching values for attribute type ${type.name}:`,
              error
            );
            return {
              type,
              values: [],
            };
          }
        })
      );

      return attributesWithValues;
    } catch (error) {
      console.error("Error fetching attributes with values:", error);
      throw error;
    }
  },

  /**
   * Fetch categories with pagination
   */
  fetchCategories: async (page = 0, size = 50): Promise<Page<CategoryDTO>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories?page=${page}&size=${size}&sortBy=name&sortDir=asc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const categoriesPage: Page<CategoryDTO> = await response.json();
      return categoriesPage;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Fetch brands with pagination
   */
  fetchBrands: async (page = 0, size = 50): Promise<Page<BrandDTO>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/brands?page=${page}&size=${size}&sortBy=brandName&sortDir=asc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status}`);
      }

      const brandsPage: Page<BrandDTO> = await response.json();
      return brandsPage;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },
};

export default FilterService;
