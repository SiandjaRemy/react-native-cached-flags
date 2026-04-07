import { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  CountryFlag,
  clearAllFlagCache,
  getCachedFlagsCount,
  getNetworkFetchCount,
  resetNetworkFetchCount,
} from 'react-native-cached-flags';
import VersionHeader from './components/VersionHeader';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
];

type RenderEntry = { id: string; code: string };

const ACCENT = '#C8F04A';
const BG = '#0A0A0F';
const SURFACE = '#13131A';
const SURFACE2 = '#1C1C27';
const BORDER = '#2A2A3A';
const TEXT = '#F0F0F5';
const MUTED = '#6B6B80';
const RED = '#FF6B6B';

export default function DemoThree() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [countInput, setCountInput] = useState('5');
  const [renders, setRenders] = useState<RenderEntry[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);
  const [lastRunFetches, setLastRunFetches] = useState<number | null>(null);
  const [lastRunCount, setLastRunCount] = useState<number | null>(null);
  const renderKey = useRef(0);

  const refreshStats = async () => {
    setFetchCount(getNetworkFetchCount());
    const count = await getCachedFlagsCount();
    setCacheCount(count);
  };

  const handleTrigger = () => {
    if (!selectedCode) return;

    const count = Math.min(Math.max(parseInt(countInput, 10) || 1, 1), 50);
    const beforeFetches = getNetworkFetchCount();

    // Generate N render entries all with the same country code
    const entries: RenderEntry[] = Array.from({ length: count }, (_, i) => ({
      id: `${++renderKey.current}-${i}`,
      code: selectedCode,
    }));

    setLastRunCount(count);
    setLastRunFetches(null); // reset until flags load
    setIsDisplaying(true);
    setRenders(entries);

    // Give flags a moment to fetch then capture how many requests were made
    setTimeout(async () => {
      const afterFetches = getNetworkFetchCount();
      setLastRunFetches(afterFetches - beforeFetches);
      await refreshStats();
    }, 2000);
  };

  const handleClearDisplay = () => {
    setRenders([]);
    setIsDisplaying(false);
    setLastRunFetches(null);
    setLastRunCount(null);
  };

  const handleClearCache = async () => {
    await clearAllFlagCache();
    resetNetworkFetchCount();
    setRenders([]);
    setIsDisplaying(false);
    setLastRunFetches(null);
    setLastRunCount(null);
    await refreshStats();
  };

  const selectedCountry = COUNTRIES.find((c) => c.code === selectedCode);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <VersionHeader />

        <Text style={styles.title}>fetch once,{'\n'}render many.</Text>
        <Text style={styles.subtitle}>
          Select a country, set the render count, and trigger. Only 1 network
          request should fire — no matter how many flags are displayed.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Country selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select country</Text>
        </View>

        <View style={styles.countryGrid}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.countryChip,
                selectedCode === c.code && styles.countryChipActive,
              ]}
              onPress={() => setSelectedCode(c.code)}
              activeOpacity={0.7}
            >
              <CountryFlag isoCode={c.code} size={24} />
              <Text
                style={[
                  styles.countryChipText,
                  selectedCode === c.code && styles.countryChipTextActive,
                ]}
              >
                {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Count input */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Number of renders</Text>
          <Text style={styles.sectionHint}>max 50</Text>
        </View>

        <View style={styles.inputRow}>
          {[1, 5, 10, 20].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.countPreset,
                countInput === String(n) && styles.countPresetActive,
              ]}
              onPress={() => setCountInput(String(n))}
            >
              <Text
                style={[
                  styles.countPresetText,
                  countInput === String(n) && styles.countPresetTextActive,
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.countInput}
            value={countInput}
            onChangeText={(v) => setCountInput(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="N"
            placeholderTextColor={MUTED}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, !selectedCode && styles.btnDisabled]}
            onPress={handleTrigger}
            disabled={!selectedCode}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>
              ▶ Trigger {countInput || '?'} render
              {parseInt(countInput, 10) !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>

          {isDisplaying && (
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleClearDisplay}
              activeOpacity={0.7}
            >
              <Text style={styles.btnSecondaryText}>Clear display</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnDanger}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <Text style={styles.btnDangerText}>Clear cache</Text>
          </TouchableOpacity>
        </View>

        {/* Result card */}
        {lastRunCount !== null && (
          <View
            style={[
              styles.resultCard,
              lastRunFetches === 1
                ? styles.resultCardSuccess
                : lastRunFetches !== null
                  ? styles.resultCardWarn
                  : styles.resultCardPending,
            ]}
          >
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Flags rendered</Text>
              <Text style={styles.resultValue}>{lastRunCount}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Network requests fired</Text>
              <Text
                style={[
                  styles.resultValue,
                  lastRunFetches === 1
                    ? styles.resultGreen
                    : lastRunFetches !== null && lastRunFetches > 1
                      ? styles.resultRed
                      : styles.resultPending,
                ]}
              >
                {lastRunFetches !== null ? lastRunFetches : '...'}
              </Text>
            </View>
            {lastRunFetches !== null && (
              <>
                <View style={styles.resultDivider} />
                <Text style={styles.resultVerdict}>
                  {lastRunFetches === 0
                    ? '✓ Served entirely from cache'
                    : lastRunFetches === 1
                      ? `✓ Deduplicated — ${lastRunCount} render${lastRunCount !== 1 ? 's' : ''}, 1 request`
                      : `✗ ${lastRunFetches} requests fired — deduplication may not be working`}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Stats bar */}
        <TouchableOpacity
          style={styles.statsBar}
          onPress={refreshStats}
          activeOpacity={0.8}
        >
          <View style={styles.stat}>
            <Text style={styles.statNum}>{fetchCount}</Text>
            <Text style={styles.statLabel}>Total network requests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{cacheCount}</Text>
            <Text style={styles.statLabel}>Items in cache</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>
              {isDisplaying ? renders.length : 0}
            </Text>
            <Text style={styles.statLabel}>Flags on screen</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.statsHint}>Tap stats to refresh</Text>

        {/* Flag grid */}
        {isDisplaying && renders.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {renders.length}× {selectedCountry?.name ?? selectedCode}
              </Text>
            </View>
            <View style={styles.flagGrid}>
              {renders.map((entry) => (
                <View key={entry.id} style={styles.flagItem}>
                  <CountryFlag
                    isoCode={entry.code}
                    size={56}
                    useSvg
                    borderRadius={6}
                    useFallbackEmoji
                    onLoad={() => console.log('flag ready')}
                    onError={(err) => console.log('failed', err)}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
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
    fontSize: 40,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -1.5,
    lineHeight: 44,
    marginBottom: 10,
    textTransform: 'lowercase',
  },
  subtitle: { fontSize: 13, color: MUTED, lineHeight: 20 },

  scroll: { paddingHorizontal: 24, paddingTop: 24 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionHint: { fontSize: 11, color: MUTED, opacity: 0.6 },

  // Country grid
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
  },
  countryChipActive: {
    backgroundColor: `${ACCENT}18`,
    borderColor: `${ACCENT}60`,
  },
  countryChipText: { fontSize: 12, fontWeight: '600', color: MUTED },
  countryChipTextActive: { color: ACCENT },

  // Count input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  countPreset: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPresetActive: {
    backgroundColor: `${ACCENT}18`,
    borderColor: `${ACCENT}60`,
  },
  countPresetText: { fontSize: 13, fontWeight: '600', color: MUTED },
  countPresetTextActive: { color: ACCENT },
  countInput: {
    width: 60,
    height: 44,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    flex: 1,
    minWidth: 160,
    backgroundColor: ACCENT,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { color: BG, fontSize: 13, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
  btnSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  btnSecondaryText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  btnDanger: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: `${RED}18`,
    borderWidth: 1,
    borderColor: `${RED}40`,
    alignItems: 'center',
  },
  btnDangerText: { color: RED, fontSize: 13, fontWeight: '600' },

  // Result card
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  resultCardSuccess: {
    backgroundColor: 'rgba(74,222,128,0.05)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  resultCardWarn: {
    backgroundColor: 'rgba(255,107,107,0.05)',
    borderColor: 'rgba(255,107,107,0.25)',
  },
  resultCardPending: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resultLabel: { fontSize: 13, color: MUTED },
  resultValue: { fontSize: 22, fontWeight: '800', color: TEXT },
  resultGreen: { color: '#4ADE80' },
  resultRed: { color: RED },
  resultPending: { color: MUTED },
  resultDivider: { height: 1, backgroundColor: BORDER, marginVertical: 4 },
  resultVerdict: {
    fontSize: 12,
    color: MUTED,
    marginTop: 8,
    lineHeight: 18,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
    marginBottom: 6,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    color: MUTED,
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },
  statsHint: {
    fontSize: 10,
    color: MUTED,
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },

  // Flag grid
  flagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  flagItem: {
    borderRadius: 6,
    overflow: 'hidden',
  },

  bottomSpacer: {
    height: 48,
  },
});
