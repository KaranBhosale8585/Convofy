"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react"; // Optional: Lucide for icons

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center mt-8 px-4">
      <div className="shadow-xl rounded-2xl p-8 max-w-md text-center animate-fade-in-down">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-red-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We're sorry for the inconvenience. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
