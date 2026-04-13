import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEY_PREFIX } from '../constants/defaults';
import { AspectRatio } from '../types';

type CachePayload = {
  svg: string;
  timestamp: number;
};

// Helper to build cache key consistently
export const buildCacheKey = (
  isoCode: string,
  aspectRatio?: AspectRatio
): string => {
  const lowerCode = isoCode.toLowerCase();
  if (aspectRatio) {
    const ratioKey = aspectRatio.replace(':', 'x');
    return `${CACHE_KEY_PREFIX}${lowerCode}_${ratioKey}`;
  }
  return `${CACHE_KEY_PREFIX}${lowerCode}`;
};

export const getCachedFlag = async (
  cacheKey: string,
  ttlDays?: number
): Promise<string | null> => {
  const cached = await AsyncStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const payload = JSON.parse(cached) as CachePayload;

    if (ttlDays && ttlDays > 0) {
      const now = Date.now();
      const ageInMs = now - payload.timestamp;
      const maxAgeMs = ttlDays * 24 * 60 * 60 * 1000;

      if (ageInMs > maxAgeMs) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
    }
    return payload.svg;
  } catch (err) {
    console.warn(
      '[react-native-cached-flags] Legacy cache format detected, migrating:',
      err
    );
    return cached;
  }
};

export const setCachedFlag = async (
  cacheKey: string,
  svg: string
): Promise<void> => {
  const payload: CachePayload = {
    svg,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
};

// Clear specific flag for a specific aspect ratio
export const clearFlagCache = async (
  isoCode: string,
  aspectRatio?: AspectRatio
): Promise<void> => {
  const cacheKey = buildCacheKey(isoCode, aspectRatio);
  await AsyncStorage.removeItem(cacheKey);
};

// Clear all flags for a specific isoCode (all aspect ratios)
export const clearAllFlagVariants = async (isoCode: string): Promise<void> => {
  const normalizedCode = isoCode.toLowerCase();
  const keys = await AsyncStorage.getAllKeys();
  const flagKeys = keys.filter(
    (k) => k.startsWith(CACHE_KEY_PREFIX) && k.includes(normalizedCode)
  );
  await (AsyncStorage as any).multiRemove(flagKeys);
};

export const clearAllFlagCache = async (): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys();
  const flagKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
  await (AsyncStorage as any).multiRemove(flagKeys);
};

export const getCachedFlagsCount = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const flagKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
    return flagKeys.length;
  } catch (error) {
    console.error('Error fetching flag cache count:', error);
    return 0;
  }
};

export const getCacheSizeKB = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const flagKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));

    const stores = await (AsyncStorage as any).multiGet(flagKeys);

    let totalBytes = 0;

    stores.forEach((item: [string, string | null]) => {
      const value = item[1];
      if (value) {
        totalBytes += value.length;
      }
    });

    return parseFloat((totalBytes / 1024).toFixed(2));
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
};
