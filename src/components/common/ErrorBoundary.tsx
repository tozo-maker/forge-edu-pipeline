
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, XCircle, Network, Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  apiContext?: boolean; // Flag to indicate if this is an API-specific error boundary
  aiContext?: boolean; // Flag to indicate if this is an AI-specific error boundary
  maxRetries?: number; // Maximum number of automatic retries
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: "api" | "ai" | "rendering" | "unknown";
  retryCount: number;
  isRetrying: boolean;
  maxRetries: number; // Add maxRetries to the state
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "unknown",
      retryCount: 0,
      isRetrying: false,
      maxRetries: props.maxRetries || 3, // Initialize from props with default
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Identify error types based on error message or other properties
    let errorType: "api" | "ai" | "rendering" | "unknown" = "unknown";
    
    if (error.message.includes("AI") || 
        error.message.includes("Claude") ||
        error.message.includes("generation") ||
        error.message.includes("content generation") ||
        error.message.includes("anthropic")) {
      errorType = "ai";
    } else if (error.message.includes("API") || 
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
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to monitoring service if we had one
    // logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Update maxRetries if props change
    if (this.props.maxRetries !== prevProps.maxRetries) {
      this.setState({ maxRetries: this.props.maxRetries || 3 });
    }
    
    // Auto-retry for API and AI errors with exponential backoff
    const { hasError, errorType, retryCount, isRetrying } = this.state;
    const { maxRetries = 3, aiContext, apiContext } = this.props;
    
    // Only attempt auto-retry for API or AI errors when they first occur and we haven't hit max retries
    if (
      hasError && 
      !prevState.hasError && 
      (errorType === "api" || errorType === "ai") &&
      retryCount < this.state.maxRetries &&
      !isRetrying
    ) {
      this.attemptRetryWithBackoff();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  attemptRetryWithBackoff = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.state.maxRetries) return;
    
    // Calculate backoff time (exponential: 1s, 2s, 4s, 8s, etc.)
    const backoffTime = Math.pow(2, retryCount) * 1000;
    
    this.setState({ isRetrying: true });
    
    this.retryTimeoutId = setTimeout(() => {
      this.resetErrorState();
      this.setState(prevState => ({ 
        retryCount: prevState.retryCount + 1,
        isRetrying: false 
      }));
    }, backoffTime);
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
      const isAiError = this.props.aiContext || this.state.errorType === "ai";
      const { isRetrying, retryCount } = this.state;
      
      return (
        <Alert variant="destructive" className="my-4 border-2">
          <AlertTitle className="flex items-center">
            {isAiError ? (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                AI Content Generation Error
              </>
            ) : isApiError ? (
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
              {isAiError 
                ? "There was a problem with the AI content generation. This might be due to temporary service limitations or prompt complexity."
                : isApiError 
                ? "There was a problem connecting to the service. This might be temporary, please try again."
                : this.state.error?.message || "An unexpected error occurred"}
            </p>
            {isRetrying ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                Attempting to recover... (Retry {retryCount}/{this.state.maxRetries})
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={this.resetErrorState}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Retry
                </Button>
                
                {(isApiError || isAiError) && (
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
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
