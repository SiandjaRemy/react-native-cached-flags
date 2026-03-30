# react-native-cached-flags

React Native country flag component with emoji fallback and **persistent SVG caching**.

Flags fetched as SVGs are saved to device storage — so the network is only hit
once per flag, ever. Subsequent renders are instant, even after app restarts.

![SVG Demo](./assets/cached-flags-svg-demo.png)
![Emoji Demo](./assets/cached-flags-emoji-demo.png)

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

### Fill box (crop to container)

```tsx
<CountryFlag isoCode="CM" size={32} useSvg fillBox borderRadius={8} />
```

---

## Props

| Prop               | Type      | Default     | Description                                         |
| ------------------ | --------- | ----------- | --------------------------------------------------- |
| `isoCode`          | `string`  | —           | ISO 3166-1 alpha-2 code e.g. `"US"`, `"CM"`, `"FR"` |
| `size`             | `number`  | —           | Width in dp — height is derived automatically (4:3) |
| `useSvg`           | `boolean` | `false`     | Use SVG with persistent cache instead of emoji      |
| `placeholderColor` | `string`  | `"#E5E7EB"` | Background shown while SVG is loading               |
| `borderRadius`     | `number`  | `4`         | Corner radius on the flag container                 |
| `testID`           | `string`  | —           | Test ID for automated testing                       |

---

## Cache utilities

```tsx
import {
  clearFlagCache,
  clearAllFlagCache,
  getCachedFlagsCount,
  getCacheSizeKB,
  getNetworkFetchCount,
  resetNetworkFetchCount,
} from 'react-native-cached-flags';

// Remove a single country from cache
await clearFlagCache('CM');

// Clear everything
await clearAllFlagCache();

// Cache stats
const count = await getCachedFlagsCount(); // number of cached flags
const size = await getCacheSizeKB(); // total cache size in KB

// Network stats (resets on app restart)
const fetches = getNetworkFetchCount(); // how many network requests were made
resetNetworkFetchCount(); // reset the counter
```

---

## How caching works

```
First render           →  cache miss  →  fetch from CDN  →  save to AsyncStorage
All future renders     →  cache hit   →  render instantly (no network)
After app restart      →  cache hit   →  still instant (persisted to disk)
```

SVG flags are sourced from [flagicons.lipis.dev](https://flagicons.lipis.dev) —
all flags share a consistent **4:3 aspect ratio**, so they align perfectly
when displayed side by side.

---

## License

MIT © [SiandjaRemy](https://github.com/SiandjaRemy)
