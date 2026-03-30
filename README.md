# react-native-cached-flags

React Native country flag component with emoji fallback and **persistent SVG caching**.

Flags fetched as SVGs are saved to device storage via AsyncStorage — so the network
is only hit once per flag, ever. Subsequent renders are instant.

## Installation

```bash
npm install react-native-cached-flags
```

### Peer dependencies (install if not already present)

```bash
npm install react-native-svg @react-native-async-storage/async-storage
```

> For Expo projects, use `npx expo install` instead to get compatible versions.

---

## Usage

### Emoji mode (default)

No network requests. Renders the system emoji for the country.

```tsx
import { CountryFlag } from 'react-native-cached-flags';

<CountryFlag isoCode="CM" size={32} />;
```

### SVG mode (cached)

Fetches the SVG once, caches it permanently. Instant on all subsequent renders.

```tsx
<CountryFlag isoCode="CM" size={32} useSvg />
```

---

## Props

| Prop               | Type      | Default     | Description                                            |
| ------------------ | --------- | ----------- | ------------------------------------------------------ |
| `isoCode`          | `string`  | —           | ISO 3166-1 alpha-2 country code (e.g. `"US"`, `"CM"`)  |
| `size`             | `number`  | —           | Width of the flag in dp. Height is derived (4:3 ratio) |
| `useSvg`           | `boolean` | `false`     | Use SVG rendering with persistent cache                |
| `placeholderColor` | `string`  | `"#E5E7EB"` | Background color shown while SVG is loading            |
| `borderRadius`     | `number`  | `4`         | Corner radius applied to the flag container            |

---

## How caching works

1. On first render, checks AsyncStorage for a cached SVG
2. If not found, fetches from `flagicons.lipis.dev` (consistent 4×3 dimensions)
3. Stores the SVG string in AsyncStorage under a namespaced key
4. All future renders for that country code are served from cache — **no network call**

To clear the cache, use the exported utility:

```tsx
import { clearFlagCache, clearAllFlagCache } from 'react-native-cached-flags';

await clearFlagCache('cm'); // clear one country
await clearAllFlagCache(); // clear all cached flags
```

---

## License

MIT © [SiandjaRemy](https://github.com/SiandjaRemy)
