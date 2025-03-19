"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"

interface GuestModeButtonProps {
  className?: string
}

export function GuestModeButton({ className }: GuestModeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleGuestMode = async () => {
    try {
      setIsLoading(true)
      
      // Set guest mode cookie
      document.cookie = `guestMode=true;path=/;max-age=${60 * 60 * 24 * 7}`
      
      toast({
        title: "Guest Mode Activated",
        description: "You're continuing as a guest. Your data will not be saved between sessions.",
      })
      
      // Redirect to builder page
      router.push("/builder")
    } catch (error) {
      console.error("Error activating guest mode:", error)
      toast({
        title: "Error",
        description: "Failed to activate guest mode. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      className={className}
      onClick={handleGuestMode}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <User className="mr-2 h-4 w-4" />
      )}
      Continue as Guest
    </Button>
  )
} 