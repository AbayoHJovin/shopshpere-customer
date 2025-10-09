export interface PriceFormatOptions {
  currency?: string;
  showCurrency?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a price with commas and optional currency
 * @param price - The price to format (number, string, or BigDecimal)
 * @param options - Formatting options
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number | string | null | undefined,
  options: PriceFormatOptions = {}
): string => {
  const {
    currency = "$",
    showCurrency = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  // Handle null, undefined, or invalid values
  if (price === null || price === undefined || price === "") {
    return showCurrency ? `${currency} 0` : "0";
  }

  // Convert to number
  let numericPrice: number;
  if (typeof price === "string") {
    numericPrice = parseFloat(price);
  } else {
    numericPrice = price;
  }

  // Handle invalid numbers
  if (isNaN(numericPrice)) {
    return showCurrency ? `${currency} 0` : "0";
  }

  // Format the number with commas
  const formattedNumber = numericPrice.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showCurrency ? `${currency} ${formattedNumber}` : formattedNumber;
};

/**
 * Format a price range (min - max)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param options - Formatting options
 * @returns Formatted price range string
 */
export const formatPriceRange = (
  minPrice: number | string | null | undefined,
  maxPrice: number | string | null | undefined,
  options: PriceFormatOptions = {}
): string => {
  const formattedMin = formatPrice(minPrice, options);
  const formattedMax = formatPrice(maxPrice, options);
  
  if (minPrice === maxPrice) {
    return formattedMin;
  }
  
  return `${formattedMin} - ${formattedMax}`;
};

/**
 * Format a discounted price with original price crossed out
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @param options - Formatting options
 * @returns Object with formatted prices
 */
export const formatDiscountedPrice = (
  originalPrice: number | string | null | undefined,
  discountedPrice: number | string | null | undefined,
  options: PriceFormatOptions = {}
) => {
  return {
    original: formatPrice(originalPrice, options),
    discounted: formatPrice(discountedPrice, options),
    hasDiscount: originalPrice !== null && discountedPrice !== null && 
                 Number(originalPrice) > Number(discountedPrice),
  };
};

/**
 * Calculate and format discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted discount percentage
 */
export const formatDiscountPercentage = (
  originalPrice: number | string | null | undefined,
  discountedPrice: number | string | null | undefined
): string => {
  if (!originalPrice || !discountedPrice) return "0%";
  
  const original = Number(originalPrice);
  const discounted = Number(discountedPrice);
  
  if (original <= discounted) return "0%";
  
  const percentage = Math.round(((original - discounted) / original) * 100);
  return `${percentage}%`;
};

/**
 * Format price for input fields (without currency)
 * @param price - The price to format
 * @returns Formatted price for input
 */
export const formatPriceForInput = (
  price: number | string | null | undefined
): string => {
  return formatPrice(price, { showCurrency: false, maximumFractionDigits: 2 });
};

/**
 * Parse formatted price string back to number
 * @param formattedPrice - Formatted price string
 * @returns Numeric price
 */
export const parsePriceFromFormatted = (formattedPrice: string): number => {
  // Remove currency, commas, and extra spaces
  const cleaned = formattedPrice
    .replace(/[A-Za-z\s]/g, "") // Remove letters and spaces
    .replace(/,/g, ""); // Remove commas
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Default export for convenience
export default {
  formatPrice,
  formatPriceRange,
  formatDiscountedPrice,
  formatDiscountPercentage,
  formatPriceForInput,
  parsePriceFromFormatted,
};
