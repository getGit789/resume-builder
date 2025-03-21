"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  attribute?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  attribute = "data-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Safely check for localStorage
    try {
      if (typeof window !== "undefined") {
        const storedTheme = localStorage.getItem(storageKey)
        return storedTheme ? (storedTheme as Theme) : defaultTheme
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remove old attribute
    if (attribute !== "class") {
      root.removeAttribute(attribute)
    }

    // Set transition class during theme change to avoid flicker (unless disabled)
    if (!disableTransitionOnChange) {
      document.documentElement.classList.add("transition-colors")
      document.documentElement.classList.add("duration-300")
    }

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const calculatedTheme = theme === "system" ? systemTheme : theme
    
    if (attribute === "class") {
      // If attribute is class, add the theme as a class
      root.classList.remove("light", "dark")
      root.classList.add(calculatedTheme)
    } else {
      // Otherwise set it as an attribute
      root.setAttribute(attribute, calculatedTheme)
    }

    // Cleanup transition classes after the transition is complete
    if (!disableTransitionOnChange) {
      const transitionTimeout = setTimeout(() => {
        document.documentElement.classList.remove("transition-colors", "duration-300")
      }, 300)
      return () => clearTimeout(transitionTimeout)
    }
  }, [theme, disableTransitionOnChange, attribute])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) {
      return
    }

    try {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      
      // Update theme if system preference changes and we're in system mode
      const onSystemThemeChange = () => {
        if (theme === "system") {
          const systemTheme = media.matches ? "dark" : "light"
          // Force a DOM update by calling setTheme
          setTheme("system")
        }
      }

      media.addEventListener("change", onSystemThemeChange)
      return () => media.removeEventListener("change", onSystemThemeChange)
    } catch (error) {
      console.error("Error setting up media query listener:", error)
    }
  }, [enableSystem, theme])

  // Safely store theme in localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, theme)
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }, [theme, storageKey])

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}
