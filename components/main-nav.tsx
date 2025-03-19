"use client"

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-8 px-6">
      {items?.length ? (
        items.map(
          (item, index) =>
            item.href && (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium px-2 py-1 transition-colors",
                  item.href === pathname 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                {item.title}
              </Link>
            )
        )
      ) : null}
    </nav>
  );
} 