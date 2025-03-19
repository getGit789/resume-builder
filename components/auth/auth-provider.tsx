"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isGuestMode: boolean
  checkAuthStatus: () => Promise<void>
  setGuestMode: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false)
  
  const {
    isAuthenticated,
    isLoading,
    checkAuth,
    user,
  } = useAuthStore()
  
  const checkAuthStatus = async () => {
    // Check if we're in guest mode
    const guestMode = localStorage.getItem("guestMode") === "true"
    setIsGuestMode(guestMode)
    
    if (!guestMode) {
      // If not in guest mode, verify authentication with the server
      await checkAuth()
    }
  }
  
  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    checkAuthStatus()
  }, [pathname])
  
  // Handle protected routes
  useEffect(() => {
    const protectedRoutes = ["/dashboard"]
    const authRoutes = ["/auth"]
    
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route))
    
    if (isLoading) return
    
    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !isAuthenticated && !isGuestMode) {
      router.push("/auth")
    }
    
    // Redirect authenticated users from auth routes
    if (isAuthRoute && (isAuthenticated || isGuestMode)) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isGuestMode, isLoading, pathname, router])
  
  const setGuestMode = (value: boolean) => {
    localStorage.setItem("guestMode", value ? "true" : "false")
    setIsGuestMode(value)
  }
  
  const value = {
    isAuthenticated,
    isLoading,
    isGuestMode,
    checkAuthStatus,
    setGuestMode,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
} 