// Service for mapping filter values between frontend and backend formats
import { FilterService, CategoryDTO, BrandDTO } from "./filterService";

interface FilterMappingCache {
  categories: Map<string, number>; // name -> id
  brands: Map<string, string>; // name -> id
  lastUpdated: number;
}

class FilterMappingService {
  private cache: FilterMappingCache = {
    categories: new Map(),
    brands: new Map(),
    lastUpdated: 0,
  };

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.cache.lastUpdated < this.CACHE_DURATION;
  }

  /**
   * Load filter mapping data from backend
   */
  private async loadMappingData(): Promise<void> {
    try {
      console.log("Loading filter mapping data from backend...");

      const results = await Promise.allSettled([
        FilterService.fetchHierarchicalCategories(),
        FilterService.fetchActiveBrands(),
      ]);

      // Process categories
      if (results[0].status === "fulfilled") {
        const categories = results[0].value;
        this.cache.categories.clear();

        const addCategoriesToMap = (cats: CategoryDTO[]) => {
          cats.forEach((cat) => {
            this.cache.categories.set(cat.name, cat.categoryId);
            // Also add subcategories
            if (cat.subcategories && cat.subcategories.length > 0) {
              addCategoriesToMap(cat.subcategories);
            }
          });
        };

        addCategoriesToMap(categories);
        console.log(
          `Loaded ${this.cache.categories.size} categories for mapping`
        );
      } else {
        console.warn(
          "Failed to load categories for mapping:",
          results[0].reason
        );
      }

      // Process brands
      if (results[1].status === "fulfilled") {
        const brands = results[1].value;
        this.cache.brands.clear();

        brands.forEach((brand) => {
          this.cache.brands.set(brand.brandName, brand.brandId);
        });

        console.log(`Loaded ${this.cache.brands.size} brands for mapping`);
      } else {
        console.warn("Failed to load brands for mapping:", results[1].reason);
      }

      this.cache.lastUpdated = Date.now();
    } catch (error) {
      console.error("Error loading filter mapping data:", error);
    }
  }

  /**
   * Ensure mapping data is loaded and cached
   */
  private async ensureMappingData(): Promise<void> {
    if (!this.isCacheValid()) {
      await this.loadMappingData();
    }
  }

  /**
   * Map category names to IDs
   */
  async mapCategoryNamesToIds(categoryNames: string[]): Promise<number[]> {
    await this.ensureMappingData();

    const categoryIds: number[] = [];

    categoryNames.forEach((name) => {
      const id = this.cache.categories.get(name);
      if (id !== undefined) {
        categoryIds.push(id);
      } else {
        console.warn(`Category name "${name}" not found in mapping cache`);
      }
    });

    console.log(
      `Mapped category names [${categoryNames.join(
        ", "
      )}] to IDs [${categoryIds.join(", ")}]`
    );
    return categoryIds;
  }

  /**
   * Map brand names to IDs
   */
  async mapBrandNamesToIds(brandNames: string[]): Promise<string[]> {
    await this.ensureMappingData();

    const brandIds: string[] = [];

    brandNames.forEach((name) => {
      const id = this.cache.brands.get(name);
      if (id !== undefined) {
        brandIds.push(id);
      } else {
        console.warn(`Brand name "${name}" not found in mapping cache`);
      }
    });

    console.log(
      `Mapped brand names [${brandNames.join(", ")}] to IDs [${brandIds.join(
        ", "
      )}]`
    );
    return brandIds;
  }

  /**
   * Get category ID by name
   */
  async getCategoryId(categoryName: string): Promise<number | undefined> {
    await this.ensureMappingData();
    return this.cache.categories.get(categoryName);
  }

  /**
   * Get brand ID by name
   */
  async getBrandId(brandName: string): Promise<string | undefined> {
    await this.ensureMappingData();
    return this.cache.brands.get(brandName);
  }

  /**
   * Clear the cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.cache.categories.clear();
    this.cache.brands.clear();
    this.cache.lastUpdated = 0;
  }

  /**
   * Get cache status (for debugging)
   */
  getCacheStatus() {
    return {
      categoriesCount: this.cache.categories.size,
      brandsCount: this.cache.brands.size,
      lastUpdated: new Date(this.cache.lastUpdated).toISOString(),
      isValid: this.isCacheValid(),
    };
  }
}

// Export singleton instance
export const filterMappingService = new FilterMappingService();
export default filterMappingService;
