export interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code e.g. "US", "CM", "FR" */
  isoCode: string;
  /** Controls the width (and derived height) of the flag */
  size: number;
  /** Use SVG rendering with persistent cache. Defaults to emoji */
  useSvg?: boolean;
  /** Background color shown while SVG is loading. Defaults to #E5E7EB */
  placeholderColor?: string;
  /** Corner radius on the flag container. Defaults to 4 */
  borderRadius?: number;
  /** Test ID */
  testID?: string;
}
