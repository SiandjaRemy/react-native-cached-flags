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

export const fetchFlag = async (
  lowerCode: string,
  aspectRatio: AspectRatio = '4:3'
): Promise<FetchFlagResult> => {
  // Ratio included in cache key so 4:3 and 1:1 are cached separately
  const cacheKey = `${lowerCode}_${aspectRatio.replace(':', 'x')}`;
  const cached = await getCachedFlag(cacheKey);
  if (cached) return { type: 'success', svg: cached }; // cache hit — counter NOT incremented

  // Cache miss — actual network request
  _fetchCount++;

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

    if (isOffline) {
      return { type: 'offline' };
    }

    console.error('[react-native-cached-flags] Fetch error:', err);
    return { type: 'error', svg: DEFAULT_FLAG_SVG };
  }
};
