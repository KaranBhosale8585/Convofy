"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
            <AlertCircleIcon className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
          {this.state.error && (
            <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto max-w-full text-left font-mono">
              {this.state.error.message}
            </pre>
          )}
          <Button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RotateCcwIcon className="w-4 h-4" />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
