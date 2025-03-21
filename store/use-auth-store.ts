import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  name: string
  email: string
  isGuest?: boolean
}

interface AuthState {
  // User state
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
  clearError: () => void
  
  // Guest actions
  continueAsGuest: () => void
  isGuestUser: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      error: null,
      
      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Make API request to login endpoint
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Login failed")
          }
          
          const data = await response.json()
          
          // Update state with user data and token
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isGuest: false,
            isLoading: false,
          })
          
          // Store token in localStorage for API requests
          localStorage.setItem("authToken", data.token)
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          })
          throw error
        }
      },
      
      // Signup action
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Make API request to signup endpoint
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Signup failed")
          }
          
          const data = await response.json()
          
          // Don't automatically log in the user after signup
          set({ isLoading: false })
          
          return data
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Signup failed",
          })
          throw error
        }
      },
      
      // Logout action
      logout: () => {
        // Clear auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: false,
        })
        
        // Remove token from localStorage
        localStorage.removeItem("authToken")
      },
      
      // Check if user is authenticated
      checkAuth: async () => {
        const { token, isGuest } = get()
        
        // If user is in guest mode, they are not authenticated but still have access
        if (isGuest) {
          return false
        }
        
        if (!token) {
          return false
        }
        
        try {
          // Verify token with the server
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          
          if (!response.ok) {
            // Token is invalid, log the user out
            get().logout()
            return false
          }
          
          const data = await response.json()
          
          // Update user data
          set({
            user: data.user,
            isAuthenticated: true,
            isGuest: false,
          })
          
          return true
        } catch (error) {
          // Error occurred, log the user out
          get().logout()
          return false
        }
      },
      
      // Continue as guest user
      continueAsGuest: () => {
        const guestId = uuidv4()
        
        set({
          user: {
            id: guestId,
            name: "Guest User",
            email: `guest-${guestId}@example.com`,
            isGuest: true
          },
          isAuthenticated: false,
          isGuest: true,
          error: null,
        })
      },
      
      // Check if current user is a guest
      isGuestUser: () => {
        const { user, isGuest } = get()
        return isGuest || (user?.isGuest ?? false)
      },
      
      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "auth-storage", // Name for the persisted storage
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
) 