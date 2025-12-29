import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">
          Paste not found. It may have expired or reached its view limit.
        </p>
        <Button asChild>
          <Link href="/">Create a new paste</Link>
        </Button>
      </div>
    </div>
  );
}
