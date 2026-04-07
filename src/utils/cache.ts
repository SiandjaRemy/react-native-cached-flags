import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEY_PREFIX } from '../constants/defaults';

// The new storage shape
type CachePayload = {
  svg: string;
  timestamp: number;
};

export const getCachedFlag = async (
  isoCode: string,
  ttlDays?: number
): Promise<string | null> => {
  const key = `${CACHE_KEY_PREFIX}${isoCode}`;
  const cached = await AsyncStorage.getItem(key);

  if (!cached) return null;

  try {
    // Attempt to parse new JSON format
    const payload = JSON.parse(cached) as CachePayload;

    if (ttlDays && ttlDays > 0) {
      const now = Date.now();
      const ageInMs = now - payload.timestamp;
      const maxAgeMs = ttlDays * 24 * 60 * 60 * 1000;

      if (ageInMs > maxAgeMs) {
        await AsyncStorage.removeItem(key);
        return null;
      }
    }
    return payload.svg;
  } catch (err) {
    console.warn(
      '[react-native-cached-flags] Legacy cache format detected, migrating:',
      err
    );
    // Backward Compatibility: If parsing fails, it's a raw SVG string from v0.1.0
    // We return it as-is. It will be updated to JSON next time it's saved.
    return cached;
  }
};

export const setCachedFlag = async (
  isoCode: string,
  svg: string
): Promise<void> => {
  const payload: CachePayload = {
    svg,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(
    `${CACHE_KEY_PREFIX}${isoCode}`,
    JSON.stringify(payload)
  );
};

export const clearFlagCache = async (isoCode: string): Promise<void> => {
  await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${isoCode}`);
};

export const clearAllFlagCache = async (): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys();
  const flagKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
  await (AsyncStorage as any).multiRemove(flagKeys);

  // await Promise.all(flagKeys.map((key) => AsyncStorage.removeItem(key)));
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

    // multiGet returns [string, string | null][]
    const stores = await (AsyncStorage as any).multiGet(flagKeys);

    let totalBytes = 0;

    // Explicitly type the tuple to avoid 'any'
    stores.forEach((item: [string, string | null]) => {
      const value = item[1];
      if (value) {
        totalBytes += value.length;
      }
    });

    // 1024 bytes = 1 KB
    return parseFloat((totalBytes / 1024).toFixed(2));
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
};
