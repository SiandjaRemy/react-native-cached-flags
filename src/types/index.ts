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

  /** Skip cache read AND write (pure network every time) */
  disableCache?: boolean;

  /**
   * Cache TTL (Time-To-Live) in days for cached flag SVGs.
   *
   * Flags rarely change, but they do occasionally (e.g., South Sudan, Kosovo, Malawi).
   * A configurable expiry prevents serving stale flags forever while balancing performance.
   *
   * @default undefined (flags never expire)
   * @example cacheTTLDays={90} // Flags expire after 90 days
   * @remarks When a flag expires, the next request will fetch a fresh copy from the network
   */
  cacheTTLDays?: number;

  /** Corner radius on the flag container. Defaults to 0 */
  borderRadius?: number;

  /** Test ID for automated testing */
  testID?: string;

  /**
   * Callback invoked when the flag SVG has successfully loaded and rendered.
   *
   * Fires after the SVG is fetched from cache or network and displayed.
   * Useful for analytics, logging, or triggering UI updates.
   *
   * @example
   * onLoad={() => console.log('Flag loaded successfully')}
   */
  onLoad?: () => void;

  /**
   * Callback invoked when the flag fails to load (network error, invalid code, etc.).
   *
   * Provides an error message to help with debugging and error handling.
   * Useful for showing fallback UI, logging errors, or retrying failed requests.
   *
   * @param error - Human-readable error description (e.g., "Network unavailable", "Invalid country code")
   * @example
   * onError={(error) => {
   *   console.error('Flag failed to load:', error);
   *   showFallbackUI();
   * }}
   */
  onError?: (error: string) => void;
}
