import { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import DemoOne from './demo/DemoOne';
import DemoTwo from './demo/DemoTwo';
import DemoThree from './demo/DemoThree';
import DemoWeb from './demo/DemoWeb';
import { preloadFlags } from 'react-native-cached-flags';

const ACCENT = '#C8F04A';
const ORANGE = '#FB923C';
const BG = '#0A0A0F';
const SURFACE = '#13131A';
const BORDER = '#2A2A3A';
const MUTED = '#6B6B80';

type Tab = 'one' | 'two' | 'three' | 'web';

export default function App() {
  const [tab, setTab] = useState<Tab>('one');

  useEffect(() => {
    // Only preload on native — no AsyncStorage on web
    if (Platform.OS === 'web') return;

    const initializeApp = async () => {
      try {
        await preloadFlags(['US', 'CM', 'FR', 'DE', 'GB', 'CA', 'JP'], {
          aspectRatio: '4:3',
          ttlDays: 7,
        });
      } catch (error) {
        console.error('[Demo] Preload failed:', error);
      }
    };

    initializeApp();
  }, []);

  const tabs: { key: Tab; label: string; accentColor: string }[] = [
    { key: 'one', label: '🚩 Flags', accentColor: ACCENT },
    { key: 'two', label: '⚡ Dedup', accentColor: ACCENT },
    { key: 'three', label: '📊 Stats', accentColor: ACCENT },
    { key: 'web', label: '🌐 Web', accentColor: ORANGE },
  ];

  return (
    <View style={styles.container}>
      {tab === 'one' && <DemoOne />}
      {tab === 'two' && <DemoTwo />}
      {tab === 'three' && <DemoThree />}
      {tab === 'web' && <DemoWeb />}

      <View style={styles.tabBar}>
        {tabs.map(({ key, label, accentColor }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabTextActive]}
            onPress={() => setTab(key)}
          >
            <Text
              style={[styles.tabText, tab === key && { color: accentColor }]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
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
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
  },
  tabTextActive: {
    borderTopWidth: 2,
    borderTopColor: ACCENT,
  },
});
