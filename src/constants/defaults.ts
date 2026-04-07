import { AspectRatio } from '../types';

export const CDN_BASE_URLS: Record<AspectRatio, string> = {
  '4:3': 'https://flagicons.lipis.dev/flags/4x3',
  '1:1': 'https://flagicons.lipis.dev/flags/1x1',
};

export const ASPECT_RATIOS: Record<string, number> = {
  '4:3': 0.75,
  '1:1': 1,
};

export const CACHE_KEY_PREFIX = '@rn_cached_flags_';

export const DEFAULT_FLAG_SVG = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="480" fill="#eeeeee"/>
</svg>`;
