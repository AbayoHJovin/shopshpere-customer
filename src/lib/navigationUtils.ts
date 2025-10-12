/**
 * Navigation utilities for handling client-side navigation with optional page reloads
 */

export interface NavigationOptions {
  /** Force a full page reload instead of client-side navigation */
  forceReload?: boolean;
  /** Replace current history entry instead of pushing new one */
  replace?: boolean;
  /** Open in new tab/window */
  newTab?: boolean;
}

/**
 * Enhanced navigation function that can force page reloads
 * @param url - The URL to navigate to
 * @param options - Navigation options
 */
export const navigateWithOptions = (
  url: string,
  options: NavigationOptions = {}
) => {
  const { forceReload = false, replace = false, newTab = false } = options;

  if (newTab) {
    window.open(url, "_blank");
    return;
  }

  if (forceReload) {
    // Force a full page reload
    if (replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
    return;
  }

  // Use Next.js router for client-side navigation
  // This will be handled by the component using useRouter
  return { url, replace };
};

/**
 * Check if we should force reload based on authentication state changes
 * @param wasAuthenticated - Previous authentication state
 * @param isAuthenticated - Current authentication state
 * @returns true if reload is recommended
 */
export const shouldForceReloadOnAuthChange = (
  wasAuthenticated: boolean,
  isAuthenticated: boolean
): boolean => {
  // Force reload when authentication state changes
  return wasAuthenticated !== isAuthenticated;
};

/**
 * Routes that should always force reload after authentication changes
 */
export const ROUTES_REQUIRING_RELOAD_ON_AUTH = [
  "/account",
  "/wishlist",
  "/cart",
  "/orders",
  "/profile",
  "/settings",
  "/checkout",
];

/**
 * Check if current route requires reload on auth change
 * @param pathname - Current pathname
 * @returns true if route requires reload
 */
export const routeRequiresReloadOnAuth = (pathname: string): boolean => {
  return ROUTES_REQUIRING_RELOAD_ON_AUTH.some((route) =>
    pathname.startsWith(route)
  );
};

/**
 * Enhanced router hook that provides reload functionality
 */
export const createEnhancedRouter = (router: any) => {
  return {
    ...router,
    pushWithReload: (url: string, options: NavigationOptions = {}) => {
      const result = navigateWithOptions(url, options);
      if (result && !options.forceReload) {
        if (result.replace) {
          router.replace(result.url);
        } else {
          router.push(result.url);
        }
      }
    },
    replaceWithReload: (url: string, options: NavigationOptions = {}) => {
      const result = navigateWithOptions(url, { ...options, replace: true });
      if (result && !options.forceReload) {
        router.replace(result.url);
      }
    },
  };
};

/**
 * Check if a mouse event has modifier keys (Ctrl, Cmd, Shift) or is a middle/right click
 * @param event - Mouse event to check
 * @returns true if event should use default browser behavior
 */
export const shouldUseDefaultBehavior = (event: React.MouseEvent): boolean => {
  return (
    event.ctrlKey || 
    event.metaKey || 
    event.shiftKey || 
    event.button === 1 || // Middle mouse button
    event.button === 2    // Right mouse button
  );
};

/**
 * Enhanced button click handler that respects modifier keys
 * @param url - URL to navigate to
 * @param options - Navigation options
 * @param onClick - Optional additional click handler
 * @returns Click handler function
 */
export const createButtonClickHandler = (
  url: string, 
  navigate: (url: string, options?: NavigationOptions) => void,
  options: NavigationOptions = {},
  onClick?: () => void
) => {
  return (event: React.MouseEvent) => {
    // Check for modifier keys
    if (shouldUseDefaultBehavior(event)) {
      // Open in new tab/window using default browser behavior
      if (onClick) onClick();
      window.open(url, '_blank');
      return;
    }

    // Normal navigation
    if (onClick) onClick();
    navigate(url, options);
  };
};
