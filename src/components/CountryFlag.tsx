import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
import { fetchFlag } from '../utils/fetchFlag';
import { ASPECT_RATIOS, DEFAULT_FLAG_SVG } from '../constants/defaults';
import type { CountryFlagProps } from '../types';

type SvgState =
  | { status: 'loading' }
  | { status: 'success'; svg: string }
  | { status: 'offline' }
  | { status: 'error'; svg: string };

export const CountryFlag = ({
  isoCode,
  size,
  useSvg = false,
  aspectRatio = '4:3',
  useFallbackEmoji = false,
  placeholderColor = '#E5E7EB',
  borderRadius = 0,
  testID,
}: CountryFlagProps) => {
  const [svgState, setSvgState] = useState<SvgState>({ status: 'loading' });

  const lowerCode = isoCode?.toLowerCase();
  const heightRatio = ASPECT_RATIOS[aspectRatio] ?? 0.75;
  const flagHeight = size * heightRatio;

  useEffect(() => {
    if (!useSvg) return;

    setSvgState({ status: 'loading' });

    if (!lowerCode) {
      setSvgState({ status: 'error', svg: DEFAULT_FLAG_SVG });
      return;
    }

    fetchFlag(lowerCode, aspectRatio).then((result) => {
      switch (result.type) {
        case 'success':
          setSvgState({ status: 'success', svg: result.svg });
          break;
        case 'offline':
          setSvgState({ status: 'offline' });
          break;
        case 'error':
          setSvgState({ status: 'error', svg: result.svg });
          break;
      }
    });
  }, [lowerCode, useSvg, aspectRatio]);

  // ── Emoji mode ──────────────────────────────────────────
  if (!useSvg) {
    const emoji = countryCodeToFlagEmoji(isoCode) || '🏳️';
    return <Text style={{ fontSize: size * 0.75 }}>{emoji}</Text>;
  }

  // ── Offline + fallback emoji enabled ─────────────────────
  if (svgState.status === 'offline' && useFallbackEmoji) {
    const emoji = countryCodeToFlagEmoji(isoCode) || '🏳️';
    return <Text style={{ fontSize: size * 0.75 }}>{emoji}</Text>;
  }

  // ── Offline + no fallback → styled placeholder ───────────
  if (svgState.status === 'offline') {
    return (
      <View
        testID={testID ?? 'flag-offline'}
        style={[
          styles.placeholder,
          styles.offlinePlaceholder,
          {
            width: size,
            height: flagHeight,
            backgroundColor: placeholderColor,
            borderRadius,
          },
        ]}
      />
    );
  }

  // ── SVG loading placeholder ──────────────────────────────
  if (svgState.status === 'loading') {
    return (
      <View
        testID={testID ?? 'flag-placeholder'}
        style={[
          styles.placeholder,
          {
            width: size,
            height: flagHeight,
            backgroundColor: placeholderColor,
            borderRadius,
          },
        ]}
      />
    );
  }

  // ── Error state ──────────────────────────────────────────
  if (svgState.status === 'error') {
    return (
      <View
        testID={testID ?? 'flag-error'}
        style={[
          styles.container,
          { width: size, height: flagHeight, borderRadius },
        ]}
      >
        <SvgXml xml={svgState.svg} width="100%" height="100%" />
      </View>
    );
  }

  // ── SVG rendered ─────────────────────────────────────────
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { width: size, height: flagHeight, borderRadius },
      ]}
    >
      <SvgXml xml={svgState.svg} width="100%" height="100%" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {},
  offlinePlaceholder: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
});
