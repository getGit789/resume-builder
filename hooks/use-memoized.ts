import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Custom hook for memoizing expensive computations with dependency tracking
 * @param computeFunc The expensive function to memoize
 * @param deps Dependencies that should trigger recomputation
 * @returns The memoized result
 */
export function useMemoized<T>(computeFunc: () => T, deps: React.DependencyList): T {
  return useMemo(computeFunc, deps);
}

/**
 * Custom hook for memoizing expensive computations with a cache timeout
 * @param computeFunc The expensive function to memoize
 * @param deps Dependencies that should trigger recomputation
 * @param timeoutMs Cache timeout in milliseconds (default: 5 minutes)
 * @returns The memoized result
 */
export function useMemoizedWithTimeout<T>(
  computeFunc: () => T, 
  deps: React.DependencyList,
  timeoutMs: number = 5 * 60 * 1000
): T {
  const resultRef = useRef<{ value: T | null; timestamp: number }>({
    value: null,
    timestamp: 0,
  });
  
  const compute = useCallback(() => {
    const now = Date.now();
    if (resultRef.current.value === null || now - resultRef.current.timestamp > timeoutMs) {
      resultRef.current = {
        value: computeFunc(),
        timestamp: now,
      };
    }
    return resultRef.current.value as T;
  }, [computeFunc, timeoutMs]);
  
  return useMemo(compute, [...deps, compute]);
}

/**
 * Custom hook for memoizing expensive async computations
 * @param asyncComputeFunc The expensive async function to memoize
 * @param deps Dependencies that should trigger recomputation
 * @returns Object containing the result, loading state, and error
 */
export function useMemoizedAsync<T>(
  asyncComputeFunc: () => Promise<T>,
  deps: React.DependencyList
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });
  
  useEffect(() => {
    let isMounted = true;
    setState(prev => ({ ...prev, loading: true }));
    
    asyncComputeFunc()
      .then(result => {
        if (isMounted) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }
      })
      .catch(error => {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error,
          });
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, deps);
  
  return state;
} 