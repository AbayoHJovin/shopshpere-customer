/**
 * Utility functions for parsing and formatting error messages
 */

export interface StockError {
  productName?: string;
  variantName?: string;
  reason: string;
  stock: number;
}

/**
 * Parses stock error messages to extract product/variant information
 */
export function parseStockError(errorMessage: string): StockError | null {
  // Pattern for variant errors: "Product variant is not available: VARIANT_NAME (reason, stock: X)"
  const variantPattern = /Product variant is not available: ([^(]+) \(([^,]+), stock: (\d+)\)/;
  const variantMatch = errorMessage.match(variantPattern);
  
  if (variantMatch) {
    return {
      variantName: variantMatch[1].trim(),
      reason: variantMatch[2].trim(),
      stock: parseInt(variantMatch[3])
    };
  }
  
  // Pattern for product errors: "Product is not available: PRODUCT_NAME (reason, stock: X)"
  const productPattern = /Product is not available: ([^(]+) \(([^,]+), stock: (\d+)\)/;
  const productMatch = errorMessage.match(productPattern);
  
  if (productMatch) {
    return {
      productName: productMatch[1].trim(),
      reason: productMatch[2].trim(),
      stock: parseInt(productMatch[3])
    };
  }
  
  // Generic insufficient stock pattern
  const insufficientStockPattern = /insufficient stock|out of stock/i;
  if (insufficientStockPattern.test(errorMessage)) {
    return {
      reason: "out of stock",
      stock: 0
    };
  }
  
  return null;
}

/**
 * Formats stock errors into user-friendly messages
 */
export function formatStockErrorMessage(errorMessage: string): string {
  console.log("🔍 DEBUG: formatStockErrorMessage input:", errorMessage);
  
  const stockError = parseStockError(errorMessage);
  console.log("🔍 DEBUG: parsed stock error:", stockError);
  
  if (!stockError) {
    console.log("🔍 DEBUG: no stock error parsed, returning generic message");
    return "Some items in your cart are no longer available. Please review your cart and try again.";
  }
  
  if (stockError.variantName) {
    if (stockError.stock === 0) {
      return `The variant "${stockError.variantName}" is currently out of stock. Please remove it from your cart or choose a different variant.`;
    } else {
      return `The variant "${stockError.variantName}" is not available for purchase at this time.`;
    }
  }
  
  if (stockError.productName) {
    if (stockError.stock === 0) {
      return `The product "${stockError.productName}" is currently out of stock. Please remove it from your cart.`;
    } else {
      return `The product "${stockError.productName}" is not available for purchase at this time.`;
    }
  }
  
  if (stockError.reason === "out of stock") {
    return "One or more items in your cart are currently out of stock. Please remove them and try again.";
  }
  
  return "Some items in your cart are no longer available. Please review your cart and try again.";
}

/**
 * Formats multiple stock errors into a single message
 */
export function formatMultipleStockErrors(errorMessages: string[]): string {
  const stockErrors = errorMessages
    .map(parseStockError)
    .filter((error): error is StockError => error !== null);
  
  if (stockErrors.length === 0) {
    return "Some items in your cart are no longer available. Please review your cart and try again.";
  }
  
  const outOfStockItems: string[] = [];
  const unavailableItems: string[] = [];
  
  stockErrors.forEach(error => {
    const itemName = error.variantName || error.productName || "Unknown item";
    
    if (error.stock === 0) {
      outOfStockItems.push(itemName);
    } else {
      unavailableItems.push(itemName);
    }
  });
  
  let message = "";
  
  if (outOfStockItems.length > 0) {
    if (outOfStockItems.length === 1) {
      message += `"${outOfStockItems[0]}" is currently out of stock.`;
    } else {
      message += `The following items are currently out of stock: ${outOfStockItems.map(item => `"${item}"`).join(", ")}.`;
    }
  }
  
  if (unavailableItems.length > 0) {
    if (message) message += " ";
    if (unavailableItems.length === 1) {
      message += `"${unavailableItems[0]}" is not available for purchase.`;
    } else {
      message += `The following items are not available for purchase: ${unavailableItems.map(item => `"${item}"`).join(", ")}.`;
    }
  }
  
  message += " Please remove them from your cart and try again.";
  
  return message;
}

/**
 * Extracts error details from API response
 */
export function extractErrorDetails(error: any): {
  errorCode?: string;
  message?: string;
  details?: string;
} {
  console.log("🔍 DEBUG: extractErrorDetails input:", error);
  console.log("🔍 DEBUG: error.response:", error.response);
  console.log("🔍 DEBUG: error.response?.data:", error.response?.data);
  
  if (error.response?.data) {
    const data = error.response.data;
    const result = {
      errorCode: data.errorCode,
      message: data.message,
      details: data.details
    };
    console.log("🔍 DEBUG: extracted result:", result);
    return result;
  }
  
  const fallback = {
    message: error.message || "An unexpected error occurred"
  };
  console.log("🔍 DEBUG: fallback result:", fallback);
  return fallback;
}
