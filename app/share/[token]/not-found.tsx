import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ResumeNotFound() {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Resume Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The shared resume you're looking for doesn't exist or is no longer available.
      </p>
      <Button asChild>
        <Link href="/">
          Return Home
        </Link>
      </Button>
    </div>
  );
} 