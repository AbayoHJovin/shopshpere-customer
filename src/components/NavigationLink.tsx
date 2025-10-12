import Link from 'next/link';
import { useEnhancedNavigation } from '@/hooks/useEnhancedNavigation';
import { NavigationOptions } from '@/lib/navigationUtils';
import { ReactNode } from 'react';

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  forceReload?: boolean;
  replace?: boolean;
  newTab?: boolean;
  onClick?: () => void;
}

export const NavigationLink = ({ 
  href, 
  children, 
  className, 
  forceReload = false,
  replace = false,
  newTab = false,
  onClick
}: NavigationLinkProps) => {
  const { navigate } = useEnhancedNavigation();

  const handleClick = (e: React.MouseEvent) => {
    // Check for modifier keys (Ctrl, Cmd, Shift) or middle mouse button
    const isModifierClick = e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
    const isRightClick = e.button === 2;
    
    // Allow default browser behavior for modifier clicks and right clicks
    if (isModifierClick || isRightClick) {
      if (onClick) {
        onClick();
      }
      return; // Don't prevent default, let browser handle it
    }

    // Only prevent default for normal left clicks
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    const options: NavigationOptions = {
      forceReload,
      replace,
      newTab
    };

    navigate(href, options);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      onMouseDown={handleClick} // Also handle middle mouse button
    >
      {children}
    </Link>
  );
};

export const ReloadLink = (props: Omit<NavigationLinkProps, 'forceReload'>) => (
  <NavigationLink {...props} forceReload={true} />
);


export const AuthLink = (props: NavigationLinkProps) => (
  <NavigationLink {...props} forceReload={true} />
);
