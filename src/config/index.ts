import { AspectRatio } from '../types';

export interface CachedFlagsConfig {
  cdnBaseUrl?: string;
  aspectRatio?: AspectRatio;
  placeholderColor?: string;
  borderRadius?: number;
  cacheTTLDays?: number;
  disableCache?: boolean;
  useFallbackEmoji?: boolean;
}

const DEFAULT_CONFIG: Required<CachedFlagsConfig> = {
  cdnBaseUrl: 'https://flagicons.lipis.dev/flags/4x3',
  aspectRatio: '4:3',
  placeholderColor: '#E5E7EB',
  borderRadius: 0,
  cacheTTLDays: undefined as any,
  disableCache: false,
  useFallbackEmoji: false,
};

// Module-level singleton — used by utilities outside React tree
let _globalConfig: Required<CachedFlagsConfig> = { ...DEFAULT_CONFIG };

export const configureCachedFlags = (config: CachedFlagsConfig): void => {
  _globalConfig = { ...DEFAULT_CONFIG, ...config };
};

export const getGlobalConfig = (): Required<CachedFlagsConfig> => _globalConfig;

export const resetConfig = (): void => {
  _globalConfig = { ...DEFAULT_CONFIG };
};
