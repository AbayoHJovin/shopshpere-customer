/**
 * Cart utility functions for consistent cart state management
 */

/**
 * Trigger cart update event to notify all components that the cart has changed
 * This should be called after any cart modification (add, remove, update)
 */
export const triggerCartUpdate = () => {
  // Dispatch custom event for components listening to cart changes
  window.dispatchEvent(new CustomEvent("cartUpdated"));
  
  // Also dispatch storage event for backward compatibility
  window.dispatchEvent(new StorageEvent("storage", {
    key: "cart",
    newValue: null, // Will be ignored, just triggers the event
    oldValue: null,
    storageArea: localStorage,
    url: window.location.href
  }));
};

/**
 * Debounced cart update to avoid excessive API calls
 */
let cartUpdateTimeout: NodeJS.Timeout | null = null;

export const debouncedCartUpdate = (delay: number = 300) => {
  if (cartUpdateTimeout) {
    clearTimeout(cartUpdateTimeout);
  }
  
  cartUpdateTimeout = setTimeout(() => {
    triggerCartUpdate();
  }, delay);
};

/**
 * Get cart item count with error handling
 */
export const getCartItemCountSafe = async (): Promise<number> => {
  try {
    const { CartService } = await import("@/lib/cartService");
    return await CartService.getCartItemsCount();
  } catch (error) {
    console.error("Error getting cart item count:", error);
    return 0;
  }
};
