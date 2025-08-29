"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getCurrentUser, logoutLocal } from "@/lib/store/slices/authSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const validateToken = async () => {
      if (token && !user) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error("Token validation failed:", error);
          dispatch(logoutLocal());
        }
      }
    };

    validateToken();
  }, [dispatch, token, user]);

  return <>{children}</>;
}
