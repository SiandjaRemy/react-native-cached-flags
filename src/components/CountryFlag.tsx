import { useEffect, useMemo, useRef, useState } from 'react';
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
  cacheTTLDays,
  borderRadius = 0,
  onLoad,
  onError,
  testID,
}: CountryFlagProps) => {
  const [svgState, setSvgState] = useState<SvgState>({ status: 'loading' });

  // Simple primitives: NO memoization ──
  const lowerCode = isoCode?.toLowerCase();

  // Layout & Styles: YES memoization ──
  // This prevents the Native UI thread from re-calculating layout unnecessarily
  const dimensions = useMemo(() => {
    const heightRatio = ASPECT_RATIOS[aspectRatio] ?? 0.75;
    return {
      width: size,
      height: size * heightRatio,
      emojiSize: size * 0.75,
    };
  }, [size, aspectRatio]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      { width: dimensions.width, height: dimensions.height, borderRadius },
    ],
    [dimensions.width, dimensions.height, borderRadius]
  );

  const placeholderStyle = useMemo(
    () => [
      styles.placeholder,
      {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: placeholderColor,
        borderRadius,
      },
    ],
    [dimensions.width, dimensions.height, placeholderColor, borderRadius]
  );

  // Logic & Effects (Bulletproofed) ──
  // Callbacks are stored in refs so they are always "fresh" but don't trigger effects
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  // Keep refs in sync with props
  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onLoad, onError]);

  useEffect(() => {
    let isMounted = true; // Track mount status for async cleanup

    if (!useSvg) return;

    setSvgState({ status: 'loading' });

    if (!lowerCode) {
      const errorMsg = 'ISO code is missing';
      setSvgState({ status: 'error', svg: DEFAULT_FLAG_SVG });
      onErrorRef.current?.(errorMsg);
      return;
    }

    fetchFlag(lowerCode, aspectRatio, cacheTTLDays).then((result) => {
      // Only proceed if the component is still visible
      if (!isMounted) return;

      switch (result.type) {
        case 'success':
          setSvgState({ status: 'success', svg: result.svg });
          onLoadRef.current?.(); // Success!
          break;
        case 'offline':
          setSvgState({ status: 'offline' });
          // Note: You might not want to call onError for offline
          // if you're showing a placeholder
          onErrorRef.current?.('Device is offline');
          break;
        case 'error':
          setSvgState({ status: 'error', svg: result.svg });
          onErrorRef.current?.('Failed to fetch SVG flag');
          break;
      }
    });

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [lowerCode, useSvg, aspectRatio, cacheTTLDays]);

  // ── Emoji mode ──────────────────────────────────────────
  if (!useSvg) {
    const emoji = countryCodeToFlagEmoji(isoCode) || '🏳️';
    return <Text style={{ fontSize: dimensions.emojiSize }}>{emoji}</Text>;
  }

  // ── Offline + fallback emoji enabled ─────────────────────
  if (svgState.status === 'offline' && useFallbackEmoji) {
    const emoji = countryCodeToFlagEmoji(isoCode) || '🏳️';
    return <Text style={{ fontSize: dimensions.emojiSize }}>{emoji}</Text>;
  }

  // ── Offline + no fallback → styled placeholder ───────────
  if (svgState.status === 'offline') {
    return (
      <View
        testID={testID ?? 'flag-offline'}
        style={[styles.offlinePlaceholder, placeholderStyle]}
      />
    );
  }

  // ── SVG loading placeholder ──────────────────────────────
  if (svgState.status === 'loading') {
    return (
      <View testID={testID ?? 'flag-placeholder'} style={placeholderStyle} />
    );
  }

  // ── Error state ──────────────────────────────────────────
  if (svgState.status === 'error') {
    return (
      <View testID={testID ?? 'flag-error'} style={containerStyle}>
        <SvgXml xml={svgState.svg} width="100%" height="100%" />
      </View>
    );
  }

  // ── SVG rendered ─────────────────────────────────────────
  return (
    <View testID={testID} style={containerStyle}>
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
