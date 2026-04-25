import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { getFlagUrl, countryCodeToFlagEmoji } from 'react-native-cached-flags';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'BR', name: 'Brazil' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
];

// IETF and subdivision format examples to showcase getFlagUrl versatility
const FORMAT_EXAMPLES = [
  { input: 'en-US', label: 'IETF tag' },
  { input: 'pt-BR', label: 'IETF tag' },
  { input: 'GB-SCT', label: 'Subdivision' },
  { input: 'GB-ENG', label: 'Subdivision' },
  { input: 'zh-CN', label: 'IETF tag' },
  { input: 'fr-CA', label: 'IETF tag' },
];

const ACCENT = '#C8F04A';
const BG = '#0A0A0F';
const SURFACE = '#13131A';
const SURFACE2 = '#1C1C27';
const BORDER = '#2A2A3A';
const TEXT = '#F0F0F5';
const MUTED = '#6B6B80';
const ORANGE = '#FB923C';

type AspectRatio = '4:3' | '1:1';

export default function DemoWeb() {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('4:3');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = (url: string) => {
    // Copy to clipboard on web
    if (Platform.OS === 'web' && navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>getFlagUrl</Text>
        </View>
        <Text style={styles.title}>web ready.</Text>
        <Text style={styles.subtitle}>
          Get raw CDN URLs for any country flag — use them in {'<img>'}, Next.js{' '}
          {'<Image>'}, CSS backgrounds, or anywhere SVG rendering isn't
          available.
        </Text>

        {/* Ratio toggle */}
        <View style={styles.ratioRow}>
          {(['4:3', '1:1'] as AspectRatio[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.ratioChip,
                selectedRatio === r && styles.ratioChipActive,
              ]}
              onPress={() => setSelectedRatio(r)}
            >
              <Text
                style={[
                  styles.ratioText,
                  selectedRatio === r && styles.ratioTextActive,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* API surface callout */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Usage</Text>
          <Text style={styles.codeText}>
            {`import { getFlagUrl } from 'react-native-cached-flags';\n\nconst url = getFlagUrl('CM', { aspectRatio: '${selectedRatio}' });\n// → '${getFlagUrl('CM', { aspectRatio: selectedRatio })}'`}
          </Text>
        </View>

        {/* Standard country grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ISO alpha-2 codes</Text>
          <Text style={styles.sectionCount}>{COUNTRIES.length} countries</Text>
        </View>

        <View style={styles.grid}>
          {COUNTRIES.map((country) => {
            const url = getFlagUrl(country.code, {
              aspectRatio: selectedRatio,
            });
            const emoji = countryCodeToFlagEmoji(country.code);
            const heightRatio = selectedRatio === '1:1' ? 1 : 0.75;

            return (
              <TouchableOpacity
                key={country.code}
                style={styles.card}
                onPress={() => url && handleCopyUrl(url)}
                activeOpacity={0.7}
              >
                {/* Flag rendered as img on web, emoji fallback everywhere */}
                {Platform.OS === 'web' && url ? (
                  // @ts-ignore — img is valid on web
                  <img
                    src={url}
                    width={64}
                    height={64 * heightRatio}
                    alt={`${country.name} flag`}
                    style={styles.img1}
                  />
                ) : (
                  <Text style={styles.emojiFlag}>{emoji ?? '🏳️'}</Text>
                )}

                <Text style={styles.cardCode}>{country.code}</Text>
                <Text style={styles.cardName} numberOfLines={1}>
                  {country.name}
                </Text>

                {/* Show resolved URL on web */}
                {Platform.OS === 'web' && url && (
                  <Text style={styles.urlPreview} numberOfLines={1}>
                    {copiedUrl === url
                      ? '✓ Copied'
                      : '.../' + country.code.toLowerCase() + '.svg'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Format examples */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Input format examples</Text>
          <Text style={styles.sectionHint}>IETF tags & subdivisions</Text>
        </View>

        <View style={styles.formatList}>
          {FORMAT_EXAMPLES.map((example) => {
            const url = getFlagUrl(example.input, {
              aspectRatio: selectedRatio,
            });
            const emoji = url ? countryCodeToFlagEmoji(example.input) : null;
            const heightRatio = selectedRatio === '1:1' ? 1 : 0.75;

            return (
              <View key={example.input} style={styles.formatRow}>
                {/* Flag */}
                <View style={styles.formatFlag}>
                  {Platform.OS === 'web' && url ? (
                    // @ts-ignore
                    <img
                      src={url}
                      width={48}
                      height={48 * heightRatio}
                      alt={`${example.input} flag`}
                      style={styles.img2}
                    />
                  ) : (
                    <Text style={styles.emojiText}>{emoji ?? '🏳️'}</Text>
                  )}
                </View>

                {/* Input → output */}
                <View style={styles.formatInfo}>
                  <View style={styles.formatInputRow}>
                    <View style={styles.formatTypeBadge}>
                      <Text style={styles.formatTypeText}>{example.label}</Text>
                    </View>
                    <Text style={styles.formatInput}>"{example.input}"</Text>
                  </View>
                  <Text style={styles.formatArrow}>↓</Text>
                  {url ? (
                    <Text style={styles.formatUrl} numberOfLines={1}>
                      {url}
                    </Text>
                  ) : (
                    <Text style={styles.formatNull}>
                      null — no region derivable
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Null case demonstration */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Returns null</Text>
          <Text style={styles.sectionHint}>Unresolvable inputs</Text>
        </View>

        <View style={styles.nullCard}>
          {['pl', 'en', 'INVALID', ''].map((input, i) => (
            <View key={i} style={styles.nullRow}>
              <Text style={styles.nullInput}>
                getFlagUrl({input === '' ? '""' : `"${input}"`})
              </Text>
              <Text style={styles.nullResult}>→ null</Text>
            </View>
          ))}
          <Text style={styles.nullNote}>
            Always check for null before rendering. Bare language tags like "pl"
            have no region — no country code can be derived.
          </Text>
        </View>

        {/* Platform note */}
        <View style={styles.platformNote}>
          <Text style={styles.platformNoteIcon}>
            {Platform.OS === 'web' ? '🌐' : '📱'}
          </Text>
          <Text style={styles.platformNoteText}>
            {Platform.OS === 'web'
              ? 'You are on web — flags render as <img> tags. Browser HTTP cache handles repeated requests automatically.'
              : 'You are on native — flags show as emoji since <img> is web-only. On web, each flag would render as an SVG image from the CDN.'}
          </Text>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

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
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE },
  pillText: {
    color: ORANGE,
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
  subtitle: { fontSize: 13, color: MUTED, lineHeight: 20, marginBottom: 20 },

  ratioRow: { flexDirection: 'row', gap: 8 },
  ratioChip: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  ratioChipActive: {
    backgroundColor: `${ORANGE}18`,
    borderColor: `${ORANGE}60`,
  },
  ratioText: { fontSize: 13, fontWeight: '600', color: MUTED },
  ratioTextActive: { color: ORANGE },

  scroll: { paddingHorizontal: 24, paddingTop: 24 },

  // Code card
  codeCard: {
    backgroundColor: SURFACE2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 28,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: ACCENT,
    lineHeight: 20,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionCount: { fontSize: 11, color: MUTED, opacity: 0.6 },
  sectionHint: { fontSize: 11, color: MUTED, opacity: 0.6 },

  // Country grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  card: {
    width: '22%',
    alignItems: 'center',
    gap: 5,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 10,
  },
  img1: {
    borderRadius: 6,
    objectFit: 'cover',
  },
  img2: {
    borderRadius: 4,
    objectFit: 'cover',
  },
  emojiText: { fontSize: 28 },
  emojiFlag: { fontSize: 36 },
  cardCode: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: 0.5,
  },
  cardName: { fontSize: 9, color: MUTED, textAlign: 'center' },
  urlPreview: {
    fontSize: 8,
    color: ORANGE,
    textAlign: 'center',
    marginTop: 2,
  },

  // Format examples
  formatList: {
    gap: 10,
    marginBottom: 28,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
  },
  formatFlag: { width: 52, alignItems: 'center' },
  formatInfo: { flex: 1 },
  formatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  formatTypeBadge: {
    backgroundColor: `${ORANGE}18`,
    borderWidth: 1,
    borderColor: `${ORANGE}40`,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  formatTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: ORANGE,
    letterSpacing: 0.5,
  },
  formatInput: { fontSize: 13, fontWeight: '700', color: TEXT },
  formatArrow: { fontSize: 11, color: MUTED, marginVertical: 2 },
  formatUrl: {
    fontSize: 11,
    color: ACCENT,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  formatNull: { fontSize: 11, color: MUTED, fontStyle: 'italic' },

  // Null cases
  nullCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  nullRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nullInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: TEXT,
  },
  nullResult: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: MUTED,
  },
  nullNote: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },

  // Platform note
  platformNote: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: `${ORANGE}08`,
    borderWidth: 1,
    borderColor: `${ORANGE}25`,
    borderRadius: 10,
    padding: 14,
    alignItems: 'flex-start',
  },
  platformNoteIcon: { fontSize: 20 },
  platformNoteText: { flex: 1, fontSize: 12, color: MUTED, lineHeight: 18 },

  footer: {
    height: 48,
  },
});
