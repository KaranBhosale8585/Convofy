"use client";

import { useEffect } from "react";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full">
        <AlertCircleIcon className="w-16 h-16 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Application Error</h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
          We&apos;ve encountered a critical error. Our team has been notified.
          In the meantime, you can try resetting the application state.
        </p>
      </div>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="flex items-center gap-2 h-11 px-8 text-lg"
          variant="default"
        >
          <RotateCcwIcon className="w-5 h-5" />
          Try Again
        </Button>
        <Button 
          onClick={() => window.location.assign("/")}
          className="h-11 px-8 text-lg"
          variant="outline"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
