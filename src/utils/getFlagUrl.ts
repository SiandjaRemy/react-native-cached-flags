import { CDN_BASE_URLS } from '../constants/defaults';
import { extractCountryCode } from './emojiFlag';
import type { AspectRatio } from '../types';

export interface GetFlagUrlOptions {
  /**
   * Aspect ratio of the flag image.
   * @default '4:3'
   */
  aspectRatio?: AspectRatio;
}

/**
 * Returns the CDN URL for a country's SVG flag.
 *
 * Accepts the same input formats as CountryFlag:
 * - ISO 3166-1 alpha-2: 'US', 'CM'
 * - IETF language tag:  'en-US', 'pt-BR'
 * - ISO subdivision:    'GB-SCT' → resolves to 'GB'
 *
 * Useful for web contexts where react-native-svg is unavailable,
 * or anywhere you need the raw URL rather than a rendered component.
 *
 * @example
 * // React Native Web / React
 * const url = getFlagUrl('US');
 * <img src={url} width={40} height={30} alt="US flag" />
 *
 * @example
 * // Next.js Image component
 * const url = getFlagUrl('en-GB', { aspectRatio: '1:1' });
 * <Image src={url} width={32} height={32} alt="GB flag" />
 *
 * @example
 * // CSS background
 * const url = getFlagUrl('CM');
 * <div style={{ backgroundImage: `url(${url})`, width: 40, height: 30 }} />
 *
 * @returns The CDN URL string, or null if the isoCode cannot be resolved.
 */
export const getFlagUrl = (
  isoCode: string,
  options: GetFlagUrlOptions = {}
): string | null => {
  const { aspectRatio = '4:3' } = options;

  const code = extractCountryCode(isoCode);
  if (!code) return null;

  const baseUrl = CDN_BASE_URLS[aspectRatio] ?? CDN_BASE_URLS['4:3'];
  return `${baseUrl}/${code.toLowerCase()}.svg`;
};
