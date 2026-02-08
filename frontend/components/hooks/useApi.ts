// frontend/src/components/hooks/useApi.ts

import { useState, useCallback, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseApiReturn<T, Args extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  execute: (...args: Args) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for handling API calls with loading, error, and success states
 */
export function useApi<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (...args: Args) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const result = await apiFunction(...args);
      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      }));
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Custom hook for handling API mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T, Args> {
  return useApi(apiFunction);
}

/**
 * Custom hook for handling API queries (GET requests)
 */
export function useQuery<T>(
  apiFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  initialData: T | null = null
): UseApiReturn<T, []> {
  const apiCall = useApi<T,[]>(apiFunction, initialData);

  useEffect(() => {
    if (dependencies.length > 0) {
      apiCall.execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return apiCall;
}