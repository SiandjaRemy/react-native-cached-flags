import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCachedFlagsCount,
  getCacheSizeKB,
  clearAllFlagVariants,
} from '../utils/cache';
import { getNetworkFetchCount } from '../utils/fetchFlag';

export interface CacheStats {
  count: number;
  sizeKB: number;
  fetchCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  clearAndRefresh: (isoCode: string) => Promise<void>; // New helper
}

interface UseCacheStatsOptions {
  pollIntervalMs?: number;
}

export const useCacheStats = (
  options: UseCacheStatsOptions = {}
): CacheStats => {
  const { pollIntervalMs = 0 } = options;

  const [count, setCount] = useState(0);
  const [sizeKB, setSizeKB] = useState(0);
  const [fetchCount, setFetchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    try {
      const [flagCount, flagSizeKB] = await Promise.all([
        getCachedFlagsCount(),
        getCacheSizeKB(),
      ]);

      if (!isMountedRef.current) return;

      setCount(flagCount);
      setSizeKB(flagSizeKB);
      setFetchCount(getNetworkFetchCount());
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  // Helper to clear a flag and refresh
  const clearAndRefresh = useCallback(
    async (isoCode: string) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      try {
        // console.log('Clearing flag variants for:', isoCode);
        await clearAllFlagVariants(isoCode);

        // Small delay to ensure AsyncStorage operations complete
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Refresh stats after clearing
        await refresh();
      } catch (error) {
        console.error('Error clearing flag:', error);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    [refresh]
  );

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    refresh();

    return () => {
      isMountedRef.current = false;
    };
  }, [refresh]);

  // Optional polling
  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) return;

    intervalRef.current = setInterval(refresh, pollIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollIntervalMs, refresh]);

  return { count, sizeKB, fetchCount, loading, refresh, clearAndRefresh };
};
