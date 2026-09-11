## Changelog

### [2.0.0]

- Added `CachedFlagsProvider` — set app-wide defaults at the root, override per-instance
- Added `configureCachedFlags()` — module-level config for utilities outside the React tree
- Added `useCachedFlagsConfig` hook — read active config from anywhere in the tree
- Added `cdnBaseUrl` config option — use your own CDN or self-hosted flag assets
- All `CountryFlag` props now read from provider config when not explicitly set
- Provider is fully opt-in — no breaking changes to existing usage

### [1.2.0]

- Added `getFlagUrl` utility for web and cross-platform usage

### [1.1.0]

- Removed `country-code-to-flag-emoji` dependency — zero runtime dependencies
- Built-in emoji generation from Unicode regional indicator symbols
- Accepts IETF language tags (`en-US`, `pt-BR`) and ISO subdivision codes (`GB-SCT`)
- Added `disableCache` prop — always fetch fresh while deduplication still applies
- Added `clearAllFlagVariants` utility — remove all aspect ratio variants for one flag
- Added `useCacheStats` hook with optional polling and `clearAndRefresh` helper
- Fixed cache key double-building bug (cache now works correctly for all aspect ratios)
- Fixed `clearAllFlagVariants` case sensitivity bug

### [1.0.0]

- Added request deduplication — N simultaneous renders trigger exactly 1 network request
- Added `cacheTTLDays` prop — optional cache expiry in days
- Added `onLoad` and `onError` callback props
- Added `preloadFlags` utility for warming the cache ahead of rendering
- Cache storage format updated to JSON payload with timestamp for TTL support
- Backward compatible with caches from v0.x
- First stable release

### [0.2.0]

- Added `aspectRatio` prop (`'4:3' | '1:1'`)
- Added `useFallbackEmoji` prop for offline graceful degradation
- Fixed: network failures no longer cached permanently
- Offline state shows dashed border placeholder
- Cache keys include aspect ratio

### [0.1.0]

- Added `getCachedFlagsCount`, `getCacheSizeKB`
- Added `getNetworkFetchCount`, `resetNetworkFetchCount`
- Improved `clearAllFlagCache` to use batch `multiRemove`

### [0.0.1]

- Initial release
- `CountryFlag` component with emoji and SVG modes
- Persistent SVG caching via AsyncStorage
- `clearFlagCache`, `clearAllFlagCache`

---
