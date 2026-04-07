export type AspectRatio = '4:3' | '1:1';

export interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code e.g. "US", "CM", "FR" */
  isoCode: string;
  /** Controls the width of the flag in dp */
  size: number;
  /** Use SVG rendering with persistent cache. Defaults to emoji */
  useSvg?: boolean;
  /** Aspect ratio of the flag. Defaults to 4:3 */
  aspectRatio?: AspectRatio;
  /** Show emoji if SVG unavailable and device is offline. Defaults to false */
  useFallbackEmoji?: boolean;
  /** Background color shown while SVG is loading. Defaults to #E5E7EB */
  placeholderColor?: string;
  /** Corner radius on the flag container. Defaults to 0 */
  borderRadius?: number;
  /** Test ID for automated testing */
  testID?: string;
}
