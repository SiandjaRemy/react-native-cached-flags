import { CDN_BASE_URL, DEFAULT_FLAG_SVG } from '../constants/defaults';
import { getCachedFlag, setCachedFlag } from './cache';
// In-memory counter — resets on app restart, which is fine for demo purposes
let _fetchCount = 0;

export const getNetworkFetchCount = () => _fetchCount;
export const resetNetworkFetchCount = () => {
  _fetchCount = 0;
};

export const fetchFlag = async (lowerCode: string): Promise<string> => {
  const cached = await getCachedFlag(lowerCode);
  if (cached) return cached; // cache hit — counter NOT incremented

  // Cache miss — actual network request
  _fetchCount++;
  try {
    const res = await fetch(`${CDN_BASE_URL}/${lowerCode}.svg`);
    if (!res.ok) {
      await setCachedFlag(lowerCode, DEFAULT_FLAG_SVG);
      return DEFAULT_FLAG_SVG;
    }
    const text = await res.text();
    await setCachedFlag(lowerCode, text);
    return text;
  } catch (err) {
    console.error('[react-native-cached-flags] Fetch error:', err);
    return DEFAULT_FLAG_SVG;
  }
};
