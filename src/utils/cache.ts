import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEY_PREFIX } from '../constants/defaults';

export const getCachedFlag = async (
  isoCode: string
): Promise<string | null> => {
  return AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${isoCode}`);
};

export const setCachedFlag = async (
  isoCode: string,
  svg: string
): Promise<void> => {
  await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${isoCode}`, svg);
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
