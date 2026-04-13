import { VALID_COUNTRY_CODES } from '../constants/countries';

const REGIONAL_INDICATOR_BASE = 0x1f1e6; // 🇦
const A_CHAR_CODE = 65; // 'A'

/**
 * Extracts a clean 2-letter ISO 3166-1 alpha-2 country code
 * from multiple accepted input formats:
 *
 * - ISO 3166-1 alpha-2:     'US', 'CM', 'FR'
 * - IETF language tag:      'en-US', 'pl', 'zh-CN'
 * - ISO subdivision code:   'GB-SCT', 'GB-ENG'
 *
 * Returns null for unrecognized or unsupported formats.
 */
export const extractCountryCode = (input: string): string | null => {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim().toUpperCase();

  // Already a clean 2-letter code: 'US', 'CM'
  if (/^[A-Z]{2}$/.test(trimmed)) {
    return trimmed;
  }

  // ISO subdivision: 'GB-SCT', 'GB-ENG' → take the country part
  if (/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(trimmed)) {
    return trimmed.slice(0, 2);
  }

  // IETF language tag: 'en-US', 'zh-CN', 'pt-BR' → take region subtag
  // Format: language[-script][-region][-variant]
  // We want the region subtag which is always 2 uppercase letters
  const ietfMatch = trimmed.match(
    /^[A-Z]{2,3}(?:-[A-Z]{4})?-([A-Z]{2})(?:-.*)?$/
  );
  if (ietfMatch?.[1]) {
    return ietfMatch[1]!;
  }

  // Single language tag with no region: 'pl', 'en' → no country code derivable
  return null;
};

/**
 * Converts a 2-letter country code to its regional indicator symbol pair.
 * Each letter maps to a Unicode regional indicator: A=🇦, B=🇧 ... Z=🇿
 * Two indicators side by side render as a flag on supported platforms.
 */
const toRegionalIndicators = (countryCode: string): string => {
  return [...countryCode]
    .map((char) => {
      const offset = char.codePointAt(0)! - A_CHAR_CODE;
      return String.fromCodePoint(REGIONAL_INDICATOR_BASE + offset);
    })
    .join('');
};

/**
 * Generates a flag emoji from various country/locale input formats.
 *
 * @param input - ISO 3166-1 alpha-2, IETF language tag, or ISO subdivision code
 * @returns Flag emoji string, or null if the input cannot be resolved
 *
 * @example
 * countryCodeToFlagEmoji('US')     // '🇺🇸'
 * countryCodeToFlagEmoji('en-US')  // '🇺🇸'
 * countryCodeToFlagEmoji('GB-SCT') // '🏴󠁧󠁢󠁳󠁣󠁴󠁿' (not supported, falls back to '🇬🇧')
 * countryCodeToFlagEmoji('pl')     // null (no region derivable)
 * countryCodeToFlagEmoji('ZZ')     // null (invalid code)
 */
export const countryCodeToFlagEmoji = (input: string): string | null => {
  const code = extractCountryCode(input);
  if (!code) return null;

  // Validate — must be a real-looking 2-letter code from predefined list
  // We don't maintain a full country list so we just verify format
  if (!code || !VALID_COUNTRY_CODES.has(code)) return null;

  return toRegionalIndicators(code);
};
