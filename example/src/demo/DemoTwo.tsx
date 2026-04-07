import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CountryFlag,
  clearAllFlagCache,
  getCachedFlagsCount,
  getCacheSizeKB,
  getNetworkFetchCount,
  resetNetworkFetchCount,
} from 'react-native-cached-flags';

// ─── Data ──────────────────────────────────────────────────────────────────────

const ALL_COUNTRIES = [
  { code: 'ZU', name: 'Zulu' },
  { code: 'US', name: 'United States' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'AR', name: 'Argentina' },
  { code: 'EG', name: 'Egypt' },
  { code: 'TR', name: 'Turkey' },
  { code: 'SE', name: 'Sweden' },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DisplayedFlag {
  code: string;
  name: string;
  cacheHit: boolean | null; // null = pending
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 10) / 2;
// const PACKAGE_VERSION = require('../../package.json').version;
const PACKAGE_VERSION =
  require('react-native-cached-flags/package.json').version;

// ─── Flag card ─────────────────────────────────────────────────────────────────

function FlagCard({
  item,
  onDismiss,
}: {
  item: DisplayedFlag;
  onDismiss: (code: string) => void;
}) {
  const scale = useRef(new Animated.Value(0.75)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 180,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  const dismiss = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.75,
        useNativeDriver: true,
        damping: 15,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(item.code));
  };

  const isHit = item.cacheHit === true;
  const isPending = item.cacheHit === null;

  return (
    <Animated.View
      style={[styles.flagCard, { transform: [{ scale }], opacity }]}
    >
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={dismiss}
        hitSlop={10}
      >
        <Text style={styles.dismissX}>×</Text>
      </TouchableOpacity>

      <View style={styles.flagCardFlag}>
        <CountryFlag isoCode={item.code} size={64} useSvg borderRadius={2} />
      </View>

      <Text style={styles.flagCardCode}>{item.code}</Text>
      <Text style={styles.flagCardName} numberOfLines={1}>
        {item.name}
      </Text>
      <CountryFlag isoCode={item.code} size={10} />

      <View
        style={[
          styles.badge,
          isPending
            ? styles.badgePending
            : isHit
              ? styles.badgeHit
              : styles.badgeMiss,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isPending
              ? styles.badgeTextPending
              : isHit
                ? styles.badgeTextHit
                : styles.badgeTextMiss,
          ]}
        >
          {isPending ? '· · ·' : isHit ? '⚡ cache hit' : '↓ network fetch'}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function DemoTwo() {
  const [available, setAvailable] = useState(ALL_COUNTRIES);
  const [displayed, setDisplayed] = useState<DisplayedFlag[]>([]);
  const [cacheCount, setCacheCount] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [fetchCount, setFetchCount] = useState(0);

  const fetchCountRef = useRef(0);

  const refreshStats = async () => {
    const [count, size] = await Promise.all([
      getCachedFlagsCount(),
      getCacheSizeKB(),
    ]);
    const fc = getNetworkFetchCount();
    setCacheCount(count);
    setCacheSize(size);
    setFetchCount(fc);
    fetchCountRef.current = fc;
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // ── Tap country → show flag ──────────────────────────────────────────────────
  const handleCountryPress = (code: string, name: string) => {
    const before = fetchCountRef.current;

    setDisplayed((prev) => [{ code, name, cacheHit: null }, ...prev]);
    setAvailable((prev) => prev.filter((c) => c.code !== code));

    setTimeout(async () => {
      const after = getNetworkFetchCount();
      const hit = after === before;
      fetchCountRef.current = after;

      setDisplayed((prev) =>
        prev.map((f) => (f.code === code ? { ...f, cacheHit: hit } : f))
      );
      await refreshStats();
    }, 300);
  };

  // ── Dismiss one card ────────────────────────────────────────────────────────
  const handleDismiss = (code: string) => {
    const country = ALL_COUNTRIES.find((c) => c.code === code)!;
    setDisplayed((prev) => prev.filter((f) => f.code !== code));
    setAvailable((prev) => {
      const merged = [...prev, country];
      return ALL_COUNTRIES.filter((c) => merged.some((m) => m.code === c.code));
    });
  };

  // ── Clear displayed (keep cache) ────────────────────────────────────────────
  const handleClearDisplayed = () => {
    setDisplayed([]);
    setAvailable(ALL_COUNTRIES);
  };

  // ── Clear cache ─────────────────────────────────────────────────────────────
  const handleClearCache = () => {
    Alert.alert(
      'Clear SVG Cache',
      'This will delete all cached flag SVGs. The next time you load a flag, it will be fetched from the network.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await clearAllFlagCache();
            resetNetworkFetchCount();
            fetchCountRef.current = 0;
            setFetchCount(0);
            setDisplayed([]);
            setAvailable(ALL_COUNTRIES);
            await refreshStats();
          },
        },
      ]
    );
  };

  const hits = displayed.filter((f) => f.cacheHit === true).length;
  const fetches = displayed.filter((f) => f.cacheHit === false).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>v{PACKAGE_VERSION} · cache SVG</Text>
        </View>

        <Text style={styles.title}>cache SVG</Text>
        <Text style={styles.subtitle}>
          Tap a country to load its SVG flag. Clear the display (not the cache),
          tap again — no new network request means caching works.
        </Text>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnWarn,
              displayed.length === 0 && styles.actionBtnDisabled,
            ]}
            onPress={handleClearDisplayed}
            disabled={displayed.length === 0}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, styles.actionBtnTextWarn]}>
              Clear display
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>
              Clear cache
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats ── */}
        <Pressable onPress={refreshStats} style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{cacheCount}</Text>
            <Text style={styles.statLabel}>in cache</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{cacheSize} KB</Text>
            <Text style={styles.statLabel}>cache size</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, fetchCount > 0 && styles.statWarn]}>
              {fetchCount}
            </Text>
            <Text style={styles.statLabel}>net requests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, styles.statGreen]}>{hits}</Text>
            <Text style={styles.statLabel}>⚡ hits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, fetches > 0 && styles.statWarn]}>
              {fetches}
            </Text>
            <Text style={styles.statLabel}>↓ fetches</Text>
          </View>
        </Pressable>

        {/* ── Displayed flags ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Displayed flags</Text>
          <Text style={styles.sectionCount}>{displayed.length}</Text>
        </View>

        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Tap a country below to load its flag
            </Text>
          </View>
        ) : (
          <View style={styles.flagGrid}>
            {displayed.map((item) => (
              <FlagCard key={item.code} item={item} onDismiss={handleDismiss} />
            ))}
          </View>
        )}

        {/* ── Country list ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Countries</Text>
          <Text style={styles.sectionCount}>
            {available.length} / {ALL_COUNTRIES.length}
          </Text>
        </View>

        <View style={styles.countryList}>
          {available.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={styles.countryRow}
              onPress={() => handleCountryPress(c.code, c.name)}
              activeOpacity={0.6}
            >
              <Text style={styles.countryCode}>{c.code}</Text>
              <Text style={styles.countryName}>{c.name}</Text>
              <Text style={styles.countryPlus}>+</Text>
            </TouchableOpacity>
          ))}
          {available.length === 0 && (
            <View style={styles.allLoadedRow}>
              <Text style={styles.allLoadedText}>All flags displayed</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Tokens ────────────────────────────────────────────────────────────────────

const ACCENT = '#C8F04A';
const BG = '#0A0A0F';
const SURFACE = '#13131A';
const SURFACE2 = '#1C1C27';
const BORDER = '#2A2A3A';
const TEXT = '#F0F0F5';
const MUTED = '#6B6B80';
const WARN = '#FF9F43';
const RED = '#FF6B6B';
const GREEN = '#2ECC71';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // ── Header ────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SURFACE2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  pillText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -2,
    lineHeight: 54,
    marginBottom: 10,
    textTransform: 'lowercase',
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
    marginBottom: 20,
  },

  // ── Actions ───────────────────────────────────────────────
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnWarn: {
    backgroundColor: `${WARN}18`,
    borderColor: `${WARN}55`,
  },
  actionBtnDanger: {
    backgroundColor: `${RED}18`,
    borderColor: `${RED}55`,
  },
  actionBtnDisabled: { opacity: 0.35 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  actionBtnTextWarn: { color: WARN },
  actionBtnTextDanger: { color: RED },

  // ── Scroll ────────────────────────────────────────────────
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  // ── Stats ─────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    marginBottom: 28,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -0.5,
  },
  statWarn: { color: WARN },
  statGreen: { color: GREEN },
  statLabel: {
    fontSize: 9,
    color: MUTED,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Section header ────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionCount: { fontSize: 11, color: MUTED, fontWeight: '600' },

  // ── Empty state ───────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
    marginBottom: 28,
  },
  emptyText: { fontSize: 13, color: MUTED },

  // ── Flag grid ─────────────────────────────────────────────
  flagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  flagCard: {
    width: CARD_W,
    backgroundColor: SURFACE2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    margin: 'auto',
  },
  dismissBtn: { position: 'absolute', top: 8, right: 10, zIndex: 10 },
  dismissX: { fontSize: 18, color: MUTED, lineHeight: 20 },
  flagCardFlag: { borderRadius: 0, overflow: 'hidden', marginTop: 6 },
  flagCardCode: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: 0.3,
  },
  flagCardName: { fontSize: 10, color: MUTED },

  // ── Badge ─────────────────────────────────────────────────
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    marginTop: 2,
  },
  badgePending: { backgroundColor: `${MUTED}18`, borderColor: `${MUTED}44` },
  badgeHit: { backgroundColor: `${GREEN}1A`, borderColor: `${GREEN}55` },
  badgeMiss: { backgroundColor: `${WARN}1A`, borderColor: `${WARN}55` },
  badgeText: { fontSize: 9, fontWeight: '700' },
  badgeTextPending: { color: MUTED },
  badgeTextHit: { color: GREEN },
  badgeTextMiss: { color: WARN },

  // ── Country list ──────────────────────────────────────────
  countryList: { gap: 6, marginBottom: 8 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: 0.5,
    width: 34,
  },
  countryName: { flex: 1, fontSize: 13, color: MUTED },
  countryPlus: { fontSize: 18, color: MUTED, fontWeight: '300' },
  allLoadedRow: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  allLoadedText: { color: GREEN, fontWeight: '600', fontSize: 13 },

  // Others

  bottomSpacer: { height: 48 },
});
