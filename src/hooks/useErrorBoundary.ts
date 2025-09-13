import { useCallback, useState } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
}

export const useErrorBoundary = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    const errorDetail: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    };
    
    setError(errorDetail);
    
    // Log to external service in production
    console.error('Error captured:', errorDetail, errorInfo);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    captureError,
    clearError,
    hasError: error !== null
  };
};