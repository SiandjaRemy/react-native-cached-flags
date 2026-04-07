<div align="center">

# 🇨🇲 react-native-cached-flags

[![npm version](https://img.shields.io/npm/v/react-native-cached-flags.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/react-native-cached-flags)
[![npm downloads](https://img.shields.io/npm/dm/react-native-cached-flags.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/react-native-cached-flags)
[![npm license](https://img.shields.io/npm/l/react-native-cached-flags.svg?style=flat-square&color=blue)](https://github.com/SiandjaRemy/react-native-cached-flags/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/SiandjaRemy/react-native-cached-flags?style=flat-square&color=blue)](https://github.com/SiandjaRemy/react-native-cached-flags)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-native-cached-flags?style=flat-square&color=blue)](https://bundlephobia.com/package/react-native-cached-flags)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>

# react-native-cached-flags

React Native country flag component with emoji fallback, persistent SVG caching,
and request deduplication.

Flags are fetched once, cached permanently to device storage, and deduplicated —
so rendering 50 instances of the same flag triggers exactly **one** network request.

![Demo](./assets/cached-flags-v1-demo.jpg)

---

## Installation

```bash
npm install react-native-cached-flags
```

### Peer dependencies

```bash
npm install react-native-svg @react-native-async-storage/async-storage
```

> For Expo projects use `npx expo install` to get compatible versions.

---

## Usage

### Emoji mode (default)

Zero network requests. Renders the platform emoji for the country.

```tsx
import { CountryFlag } from 'react-native-cached-flags';

<CountryFlag isoCode="CM" size={32} />;
```

### SVG mode (cached)

Fetches once, caches permanently. Instant on every subsequent render.

```tsx
<CountryFlag isoCode="CM" size={32} useSvg />
```

### Custom aspect ratio

```tsx
<CountryFlag isoCode="CM" size={32} useSvg aspectRatio="1:1" />
```

### Offline fallback

Show an emoji instead of a placeholder when offline and the flag is not yet cached:

```tsx
<CountryFlag isoCode="CM" size={32} useSvg useFallbackEmoji />
```

### Cache TTL

Flags rarely change, but they do occasionally. Set an expiry to ensure
stale flags are eventually refreshed:

```tsx
<CountryFlag isoCode="CM" size={32} useSvg cacheTTLDays={90} />
```

### Load and error callbacks

```tsx
<CountryFlag
  isoCode="CM"
  size={32}
  useSvg
  onLoad={() => console.log('Flag ready')}
  onError={(message) => console.error('Flag failed:', message)}
/>
```

### Preload flags before rendering

Warm the cache ahead of time — ideal for onboarding flows and country pickers:

```tsx
import { preloadFlags } from 'react-native-cached-flags';

await preloadFlags(['US', 'CM', 'FR', 'DE', 'JP'], {
  aspectRatio: '4:3',
  ttlDays: 30,
});
// All flags are now cached — rendering will be instant
```

---

## Props

| Prop               | Type                        | Default     | Description                                            |
| ------------------ | --------------------------- | ----------- | ------------------------------------------------------ |
| `isoCode`          | `string`                    | —           | ISO 3166-1 alpha-2 code e.g. `"US"`, `"CM"`, `"FR"`    |
| `size`             | `number`                    | —           | Width in dp — height derived from aspect ratio         |
| `useSvg`           | `boolean`                   | `false`     | Use SVG with persistent cache instead of emoji         |
| `aspectRatio`      | `'4:3' \| '1:1'`            | `'4:3'`     | Aspect ratio of the rendered flag                      |
| `useFallbackEmoji` | `boolean`                   | `false`     | Show emoji if offline and flag not yet cached          |
| `cacheTTLDays`     | `number`                    | `undefined` | Days before a cached flag expires and is re-fetched    |
| `placeholderColor` | `string`                    | `'#E5E7EB'` | Background color shown while SVG is loading            |
| `borderRadius`     | `number`                    | `0`         | Corner radius on the flag container                    |
| `onLoad`           | `() => void`                | —           | Called when SVG renders successfully                   |
| `onError`          | `(message: string) => void` | —           | Called when flag fails to load, with error description |
| `testID`           | `string`                    | —           | Test ID for automated testing                          |

---

## Offline behaviour

| Scenario            | `useFallbackEmoji` | Result                        |
| ------------------- | ------------------ | ----------------------------- |
| Cache hit           | any                | SVG renders instantly         |
| Cache miss, online  | any                | Fetch once, cache, render SVG |
| Cache miss, offline | `false`            | Dashed placeholder shown      |
| Cache miss, offline | `true`             | Emoji fallback rendered       |
| HTTP error          | any                | Default grey SVG shown        |

---

## Request deduplication

Rendering the same flag multiple times simultaneously triggers only **one**
network request. All instances share the in-flight promise and render together
when it resolves.

```tsx
// These 20 components trigger exactly 1 network request between them
{
  Array.from({ length: 20 }).map((_, i) => (
    <CountryFlag key={i} isoCode="CM" size={32} useSvg />
  ));
}
```

---

## Cache utilities

```tsx
import {
  preloadFlags,
  clearFlagCache,
  clearAllFlagCache,
  getCachedFlagsCount,
  getCacheSizeKB,
  getNetworkFetchCount,
  resetNetworkFetchCount,
} from 'react-native-cached-flags';

// Preload a set of flags into cache before rendering
await preloadFlags(['US', 'CM', 'FR'], { aspectRatio: '4:3', ttlDays: 30 });

// Remove a single country from cache
await clearFlagCache('CM');

// Clear everything
await clearAllFlagCache();

// Cache stats
const count = await getCachedFlagsCount(); // number of flags currently cached
const size = await getCacheSizeKB(); // total cache size in KB

// Network request tracking (resets on app restart)
const fetches = getNetworkFetchCount();
resetNetworkFetchCount();
```

---

## How caching works

```
First render         →  cache miss   →  fetch from CDN  →  save to AsyncStorage
Simultaneous renders →  deduplicated →  1 fetch shared across all instances
All future renders   →  cache hit    →  instant, no network
After app restart    →  cache hit    →  still instant (persisted to disk)
TTL expired          →  cache miss   →  re-fetches fresh copy from CDN
Offline, no cache    →  placeholder or emoji fallback (never caches failures)
```

SVG flags are sourced from [flagicons.lipis.dev](https://flagicons.lipis.dev) —
all flags share a consistent aspect ratio so they align perfectly side by side.

---

## Changelog

### [1.0.0]

- Added request deduplication — N simultaneous renders of the same flag trigger exactly 1 network request
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

## License

MIT © [SiandjaRemy](https://github.com/SiandjaRemy)
