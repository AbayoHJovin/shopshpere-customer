import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { 
  NavigationOptions, 
  navigateWithOptions, 
  shouldForceReloadOnAuthChange,
  routeRequiresReloadOnAuth,
  createButtonClickHandler
} from '@/lib/navigationUtils';
import { useAppSelector } from '@/lib/store/hooks';

export const useEnhancedNavigation = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const previousAuthState = useRef(isAuthenticated);

  const navigate = useCallback((url: string, options: NavigationOptions = {}) => {
    const currentPath = window.location.pathname;
    
    const authStateChanged = shouldForceReloadOnAuthChange(
      previousAuthState.current, 
      isAuthenticated
    );
    
    const shouldForceReload = options.forceReload || 
      (authStateChanged && routeRequiresReloadOnAuth(url));

    const finalOptions = {
      ...options,
      forceReload: shouldForceReload
    };

    const result = navigateWithOptions(url, finalOptions);
    
    if (result && !finalOptions.forceReload) {
      if (result.replace) {
        router.replace(result.url);
      } else {
        router.push(result.url);
      }
    }

    // Update previous auth state
    previousAuthState.current = isAuthenticated;
  }, [router, isAuthenticated]);

  /**
   * Navigate with forced reload
   */
  const navigateWithReload = useCallback((url: string, replace = false) => {
    navigate(url, { forceReload: true, replace });
  }, [navigate]);

  /**
   * Navigate to authenticated routes (forces reload if auth state changed)
   */
  const navigateToAuthRoute = useCallback((url: string, options: NavigationOptions = {}) => {
    navigate(url, { ...options, forceReload: true });
  }, [navigate]);

  /**
   * Refresh current page
   */
  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  /**
   * Create a button click handler that respects modifier keys
   */
  const createClickHandler = useCallback((
    url: string, 
    options: NavigationOptions = {},
    onClick?: () => void
  ) => {
    return createButtonClickHandler(url, navigate, options, onClick);
  }, [navigate]);

  return {
    navigate,
    navigateWithReload,
    navigateToAuthRoute,
    refresh,
    createClickHandler,
    // Expose original router methods
    push: router.push,
    replace: router.replace,
    back: router.back,
    forward: router.forward
  };
};
