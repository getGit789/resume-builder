"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Custom hook that combines NextAuth session with additional authentication functionality
 * Most importantly, this hook ensures guest mode cookies are cleared when a user is authenticated
 */
export function useAuthStatus() {
  const { data: session, status } = useSession();
  const { isAuthenticated } = useAuthStore();

  // Clear guest mode cookies if a user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      // Clear guest mode cookies to ensure we don't have conflicting state
      document.cookie = 'guestMode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'guestToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Also clear local storage items related to guest mode
      if (typeof window !== "undefined") {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
          if (key.includes("guest")) {
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log("Guest mode cleared for authenticated user");
    }
  }, [status, session]);

  return { session, status };
} 