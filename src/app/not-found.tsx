import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GhostIcon, ArrowLeftIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mt-19 flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="bg-muted/40 p-8 rounded-2xl shadow-xl max-w-md w-full space-y-4">
        <div className="flex justify-center">
          <GhostIcon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Oops! Page Not Found
        </h1>
        <p className="text-muted-foreground">
          Looks like you’re lost in the chat. This page doesn’t exist or has
          been moved.
        </p>
        <Link href="/">
          <Button className="gap-2 mt-4">
            <ArrowLeftIcon className="w-4 h-4" />
            Go back to Convofy Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
