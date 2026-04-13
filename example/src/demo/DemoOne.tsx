import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import {
  CountryFlag,
  clearAllFlagCache,
  useCacheStats,
  resetNetworkFetchCount,
} from 'react-native-cached-flags';
import VersionHeader from './components/VersionHeader';

const COUNTRIES = [
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
];

type Mode = 'emoji' | 'svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 20) / 3; // 48 padding, 20 gap

export default function DemoOne() {
  const { count, sizeKB, fetchCount, refresh, clearAndRefresh } =
    useCacheStats();

  const [mode, setMode] = useState<Mode>('emoji');
  const [featuredCountry, setFeaturedCountry] = useState({
    code: 'CM',
    name: 'Cameroon',
  });

  const handleFlagPress = (code: string, name: string) => {
    setFeaturedCountry({ code, name });
    // if (mode === 'svg') {
    //   setFeaturedCountry({ code, name });
    // }
  };

  const handleModeChange = (modeName: Mode) => {
    setMode(modeName);
    // if (modeName === 'emoji') {
    //   resetNetworkFetchCount();
    // }
  };

  const handleClearAllCache = async () => {
    Alert.alert(
      'Clear All Cache',
      'Are you sure you want to clear all cached flags? This will switch to emoji mode.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setMode('emoji');
            await clearAllFlagCache();
            resetNetworkFetchCount();
          },
        },
      ]
    );
  };

  const handleClearCurrentFlag = async () => {
    Alert.alert(
      'Clear Flag Cache',
      `Remove "${featuredCountry.name}" (${featuredCountry.code}) from cache and switch to emoji mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await clearAndRefresh(featuredCountry.code);
            setMode('emoji');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <VersionHeader />
        </View>
        <Text style={styles.title}>cached flags</Text>
        <Text style={styles.subtitle}>
          Country flags for React Native.{'\n'}
          SVG-powered. Cached forever.
        </Text>

        {/* Mode toggle with clear button */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'emoji' && styles.toggleBtnActive,
              ]}
              onPress={() => handleModeChange('emoji')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  mode === 'emoji' && styles.toggleLabelActive,
                ]}
              >
                Emoji
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'svg' && styles.toggleBtnActive,
              ]}
              onPress={() => setMode('svg')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  mode === 'svg' && styles.toggleLabelActive,
                ]}
              >
                SVG
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'svg' && (
            <TouchableOpacity
              style={styles.clearCacheBtn}
              onPress={handleClearAllCache}
              activeOpacity={0.7}
            >
              <Text style={styles.clearCacheText}>Clear All Cache</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Flag grid */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Large featured flag */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredFlag}>
            <CountryFlag
              isoCode={featuredCountry.code}
              size={120}
              useSvg={mode === 'svg'}
              borderRadius={12}
            />
          </View>
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredCode}>{featuredCountry.code}</Text>
            <Text style={styles.featuredName}>{featuredCountry.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {mode === 'svg' ? '⚡ SVG cached' : '✦ Emoji'}
                </Text>
              </View>
              {mode === 'svg' && (
                <TouchableOpacity
                  style={styles.clearFlagBtn}
                  onPress={handleClearCurrentFlag}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearFlagText}>Clear from cache</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Section label */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sample countries</Text>
          <Text style={styles.sectionCount}>{COUNTRIES.length}</Text>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {COUNTRIES.map((c, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleFlagPress(c.code, c.name)}
              activeOpacity={mode === 'svg' ? 0.7 : 1}
              // disabled={mode !== 'svg'}
            >
              <View style={styles.flagWrap}>
                <CountryFlag
                  isoCode={c.code}
                  size={64}
                  useSvg={mode === 'svg'}
                  borderRadius={8}
                />
              </View>
              <Text style={styles.cardCode}>{c.code}</Text>
              <Text style={styles.cardName} numberOfLines={1}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer stat bar */}
        <Pressable onPress={refresh} style={styles.statBar}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{count}</Text>
            <Text style={styles.statLabel}>Items cached</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{sizeKB} KB</Text>
            <Text style={styles.statLabel}>Cache size</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{fetchCount}</Text>
            <Text style={styles.statLabel}>Network requests</Text>
          </View>
        </Pressable>

        <View />
      </ScrollView>
    </View>
  );
}

const ACCENT = '#C8F04A'; // electric lime
const BG = '#0A0A0F';
const SURFACE = '#13131A';
const SURFACE2 = '#1C1C27';
const BORDER = '#2A2A3A';
const TEXT = '#F0F0F5';
const MUTED = '#6B6B80';
const ERROR_RED = '#FF6B6B';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ─── Header ────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
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
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
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
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
    marginBottom: 24,
  },

  // ─── Toggle Container ──────────────────────────────────
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: ACCENT,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },
  toggleLabelActive: {
    color: '#0A0A0F',
  },
  clearCacheBtn: {
    backgroundColor: ERROR_RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${ERROR_RED}88`,
  },
  clearCacheText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '600',
  },

  // ─── Scroll ────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // ─── Featured card ─────────────────────────────────────
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 28,
  },
  featuredFlag: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredInfo: {
    flex: 1,
  },
  featuredCode: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -1,
  },
  featuredName: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: `${ACCENT}22`,
    borderWidth: 1,
    borderColor: `${ACCENT}44`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '600',
  },
  clearFlagBtn: {
    backgroundColor: `${ERROR_RED}22`,
    borderWidth: 1,
    borderColor: `${ERROR_RED}44`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearFlagText: {
    fontSize: 11,
    color: ERROR_RED,
    fontWeight: '600',
  },

  // ─── Section header ────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  // ─── Grid ──────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 28,
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
    gap: 6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
  },
  flagWrap: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardCode: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 9,
    color: MUTED,
    textAlign: 'center',
  },

  // ─── Stat bar ──────────────────────────────────────────
  statBar: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
});
