export { CountryFlag } from './components/CountryFlag';
export {
  clearFlagCache,
  clearAllFlagVariants,
  clearAllFlagCache,
  getCachedFlagsCount,
  getCacheSizeKB,
} from './utils/cache';
export { preloadFlags } from './utils/fetchFlag';
export {
  getNetworkFetchCount,
  resetNetworkFetchCount,
} from './utils/fetchFlag';

export { useCacheStats } from './hooks/useCacheStats';
export type { CacheStats } from './hooks/useCacheStats';

export { countryCodeToFlagEmoji, extractCountryCode } from './utils/emojiFlag';

export { getFlagUrl } from './utils/getFlagUrl';
export type { GetFlagUrlOptions } from './utils/getFlagUrl';

export type { CountryFlagProps } from './types';
