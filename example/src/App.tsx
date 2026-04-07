import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DemoOne from './demo/DemoOne';
import DemoTwo from './demo/DemoTwo';
import DemoThree from './demo/DemoThree';
import { preloadFlags } from 'react-native-cached-flags';

const ACCENT = '#C8F04A';
const BG = '#0A0A0F';
const SURFACE = '#13131A';
const BORDER = '#2A2A3A';
const MUTED = '#6B6B80';

export default function App() {
  const [tab, setTab] = useState<'one' | 'two' | 'three'>('three');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[Demo] Preloading flags...');

        // Preload common flags used across your three demos
        await preloadFlags(['US', 'CM', 'FR', 'DE', 'GB', 'CA', 'JP'], {
          aspectRatio: '4:3',
          ttlDays: 7, // Optional: Refresh every week
        });

        console.log('[Demo] Flags cached successfully!');
      } catch (error) {
        console.error('[Demo] Preload failed:', error);
      }
    };

    initializeApp();
  }, []); // Run once on mount

  return (
    <View style={styles.container}>
      {tab === 'one' && <DemoOne />}
      {tab === 'two' && <DemoTwo />}
      {tab === 'three' && <DemoThree />}

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'one' && styles.tabActive]}
          onPress={() => setTab('one')}
        >
          <Text style={[styles.tabText, tab === 'one' && styles.tabTextActive]}>
            Demo One
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'two' && styles.tabActive]}
          onPress={() => setTab('two')}
        >
          <Text style={[styles.tabText, tab === 'two' && styles.tabTextActive]}>
            Demo Two
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'three' && styles.tabActive]}
          onPress={() => setTab('three')}
        >
          <Text
            style={[styles.tabText, tab === 'three' && styles.tabTextActive]}
          >
            Demo Three
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: ACCENT,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },
  tabTextActive: {
    color: ACCENT,
  },
});
