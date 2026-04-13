import { extractCountryCode, countryCodeToFlagEmoji } from '../utils/emojiFlag';

describe('Emoji Utility Logic', () => {
  test('extracts region from IETF tags', () => {
    expect(extractCountryCode('en-US')).toBe('US');
    expect(extractCountryCode('fr-FR')).toBe('FR');
  });

  test('validates against the official ISO list', () => {
    expect(countryCodeToFlagEmoji('US')).toBe('🇺🇸');
    expect(countryCodeToFlagEmoji('XY')).toBeNull(); // Not a real country
  });
});
