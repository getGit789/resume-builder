import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find the page you were looking for.
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: "default",
              })
            )}
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({
                variant: "outline",
              })
            )}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 