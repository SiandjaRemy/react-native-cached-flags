import { CDN_BASE_URLS, DEFAULT_FLAG_SVG } from '../constants/defaults';
import { AspectRatio } from '../types';
import { getCachedFlag, setCachedFlag } from './cache';
// In-memory counter — resets on app restart, which is fine for demo purposes
let _fetchCount = 0;

export const getNetworkFetchCount = () => _fetchCount;
export const resetNetworkFetchCount = () => {
  _fetchCount = 0;
};

export type FetchFlagResult =
  | { type: 'success'; svg: string }
  | { type: 'offline' }
  | { type: 'error'; svg: string };

// ✅ Deduplication map — key: `${lowerCode}_${ratio}`, value: in-flight Promise
const _inFlightRequests = new Map<string, Promise<FetchFlagResult>>();

export const fetchFlag = async (
  lowerCode: string,
  aspectRatio: AspectRatio = '4:3',
  ttlDays?: number // The number of days the cache should be stored
): Promise<FetchFlagResult> => {
  // Ratio included in cache key so 4:3 and 1:1 are cached separately
  const cacheKey = `${lowerCode}_${aspectRatio.replace(':', 'x')}`;

  // 1. Cache hit — serve immediately
  const cached = await getCachedFlag(cacheKey, ttlDays);
  if (cached) return { type: 'success', svg: cached };

  // 2. In-flight deduplication — if a fetch for this key is already running,
  //    return the same promise so all callers share one network request
  const inFlight = _inFlightRequests.get(cacheKey);
  if (inFlight) return inFlight;

  // 3. No cache, no in-flight request — start a new fetch
  _fetchCount++;

  const fetchPromise = (async (): Promise<FetchFlagResult> => {
    try {
      const baseUrl = CDN_BASE_URLS[aspectRatio] ?? CDN_BASE_URLS['4:3'];
      const res = await fetch(`${baseUrl}/${lowerCode}.svg`);

      if (!res.ok) {
        // Failures are not cached sinced users might come online later
        console.warn(
          `[react-native-cached-flags] HTTP ${res.status} for ${lowerCode}`
        );
        return { type: 'error', svg: DEFAULT_FLAG_SVG };
      }

      const text = await res.text();
      await setCachedFlag(cacheKey, text);
      return { type: 'success', svg: text };
    } catch (err) {
      // Network error — likely offline
      const isOffline =
        err instanceof TypeError &&
        (err.message.includes('Network request failed') ||
          err.message.includes('Failed to fetch'));

      if (isOffline) return { type: 'offline' };

      console.error('[react-native-cached-flags] Fetch error:', err);
      return { type: 'error', svg: DEFAULT_FLAG_SVG };
    } finally {
      // ✅ Always clean up — whether success, error or offline
      _inFlightRequests.delete(cacheKey);
    }
  })();

  // Register in-flight before any await so subsequent calls see it immediately
  _inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

// Expose for testing and demo
export const getInFlightCount = () => _inFlightRequests.size;

// Warm the cache before rendering, useful for onboarding flows or country pickers
export const preloadFlags = async (
  isoCodes: string[],
  options?: { aspectRatio?: AspectRatio; ttlDays?: number }
): Promise<void> => {
  const ratio = options?.aspectRatio ?? '4:3';
  const ttl = options?.ttlDays;

  const BATCH_SIZE = 10; // Prevent choking the network tab

  // Process in chunks to maintain smooth app performance
  for (let i = 0; i < isoCodes.length; i += BATCH_SIZE) {
    const batch = isoCodes.slice(i, i + BATCH_SIZE);

    // Use allSettled so one failure doesn't reject the whole batch
    await Promise.allSettled(
      batch.map((code) => fetchFlag(code.toLowerCase(), ratio, ttl))
    );
  }
};
