"use client"

import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  
  // Only show navigation links on builder and dashboard pages
  const showNavLinks = pathname?.includes('/builder') || pathname?.includes('/dashboard');
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex-1">
          <Link href="/" className="font-semibold text-lg">
            {/* Branding removed */}
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
      </div>
    </header>
  );
} 