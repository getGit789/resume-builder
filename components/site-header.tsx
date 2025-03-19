"use client"

import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  // Check if we're in guest mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsGuestMode(localStorage.getItem("guestMode") === "true");
    }
  }, []);
  
  // Only show navigation links on builder and dashboard pages
  const showNavLinks = pathname?.includes('/builder') || pathname?.includes('/dashboard');
  
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
  
  const handleExitGuestMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("guestMode", "false");
      // Also clear the cookie
      document.cookie = "guestMode=false; path=/; max-age=0";
      setIsGuestMode(false);
      router.push("/auth");
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex-1">
          <Link href="/" className="font-semibold text-lg">
            {/* Empty logo space */}
          </Link>
        </div>
        
        {showNavLinks && (
          <MainNav items={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Create Resume",
              href: "/builder",
            },
          ]} />
        )}
        
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  {session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isGuestMode ? (
            <Button variant="outline" size="sm" onClick={handleExitGuestMode}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Exit Guest Mode</span>
            </Button>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 