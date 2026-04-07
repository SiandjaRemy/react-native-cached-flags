import { StyleSheet, Text, View } from 'react-native';

const PACKAGE_VERSION =
  require('react-native-cached-flags/package.json').version;

const VersionHeader = () => {
  return (
    <View style={styles.pill}>
      <View style={styles.pillDot} />
      <Text style={styles.pillText}>v{PACKAGE_VERSION} · cache SVG</Text>
    </View>
  );
};

export default VersionHeader;

// ─── Tokens ────────────────────────────────────────────────────────────────────

const ACCENT = '#C8F04A';
const SURFACE2 = '#1C1C27';
const BORDER = '#2A2A3A';

const styles = StyleSheet.create({
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
});
