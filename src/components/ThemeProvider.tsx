"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force light theme only - disable theme switching
  return (
    <NextThemesProvider 
      {...props} 
      defaultTheme="light" 
      forcedTheme="light"
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
