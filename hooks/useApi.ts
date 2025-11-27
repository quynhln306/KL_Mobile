/**
 * useApi Hook
 * Custom hook để xử lý API calls với loading và error states
 */

import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: UseApiOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(err.message || 'Unknown error');
        setError(error);
        
        if (options?.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
