
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, XCircle, Network } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  apiContext?: boolean; // Flag to indicate if this is an API-specific error boundary
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: "api" | "rendering" | "unknown";
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "unknown",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Identify error types based on error message or other properties
    let errorType: "api" | "rendering" | "unknown" = "unknown";
    
    if (error.message.includes("API") || 
        error.message.includes("fetch") || 
        error.message.includes("network") ||
        error.message.includes("HTTP")) {
      errorType = "api";
    } else {
      errorType = "rendering";
    }
    
    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to monitoring service if we had one
    // logErrorToService(error, errorInfo);
  }

  resetErrorState = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isApiError = this.props.apiContext || this.state.errorType === "api";
      
      return (
        <Alert variant="destructive" className="my-4 border-2">
          <AlertTitle className="flex items-center">
            {isApiError ? (
              <>
                <Network className="h-5 w-5 mr-2" />
                API Communication Error
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 mr-2" />
                Something went wrong
              </>
            )}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              {isApiError 
                ? "There was a problem connecting to the AI service. This might be temporary, please try again."
                : this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.resetErrorState}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
              
              {isApiError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Reload Page
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
