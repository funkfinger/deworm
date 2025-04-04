import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for debounced and rate-limited search
 * @param searchFn The search function to call
 * @param debounceMs Debounce time in milliseconds
 * @param minQueryLength Minimum query length to trigger search
 * @param rateLimitMs Minimum time between API calls in milliseconds
 * @returns Object containing search handler, loading state, and last query
 */
export function useOptimizedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  debounceMs = 500,
  minQueryLength = 2,
  rateLimitMs = 1000
) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const lastSearchTime = useRef<number>(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingSearch = useRef<string | null>(null);

  // Clear any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const executeSearch = useCallback(
    async (query: string) => {
      // Don't search if query is too short
      if (query.trim().length < minQueryLength) return;

      // Don't search if it's the same as the last query
      if (query === lastQuery) {
        // For testing purposes, we need to ensure this is properly tracked
        setIsLoading(false);
        return;
      }

      const now = Date.now();
      const timeElapsed = now - lastSearchTime.current;

      // If we're within rate limit, schedule the search for later
      if (timeElapsed < rateLimitMs) {
        pendingSearch.current = query;

        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
          if (pendingSearch.current) {
            executeSearch(pendingSearch.current);
            pendingSearch.current = null;
          }
        }, rateLimitMs - timeElapsed);

        return;
      }

      // Execute the search
      setIsLoading(true);
      try {
        await searchFn(query);
        lastSearchTime.current = Date.now();
        setLastQuery(query);
      } finally {
        setIsLoading(false);
      }
    },
    [lastQuery, minQueryLength, rateLimitMs, searchFn]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim().length < minQueryLength) return;

      // Clear any existing timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Set a new timeout for debounce
      searchTimeout.current = setTimeout(() => {
        executeSearch(query);
      }, debounceMs);
    },
    [debounceMs, executeSearch, minQueryLength]
  );

  return {
    handleSearch,
    isLoading,
    lastQuery,
  };
}
