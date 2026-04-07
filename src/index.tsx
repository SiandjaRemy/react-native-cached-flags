export { CountryFlag } from './components/CountryFlag';
export {
  clearFlagCache,
  clearAllFlagCache,
  getCachedFlagsCount,
  getCacheSizeKB,
} from './utils/cache';
export { preloadFlags } from './utils/fetchFlag';
export {
  getNetworkFetchCount,
  resetNetworkFetchCount,
} from './utils/fetchFlag';
export type { CountryFlagProps } from './types';
