import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
import { fetchFlag } from '../utils/fetchFlag';
import { DEFAULT_FLAG_SVG } from '../constants/defaults';
import type { CountryFlagProps } from '../types';

export const CountryFlag = ({
  isoCode,
  size,
  useSvg = false,
  placeholderColor = '#E5E7EB',
  borderRadius = 4,
}: CountryFlagProps) => {
  const [svgXml, setSvgXml] = useState<string | null>(null);

  const lowerCode = isoCode?.toLowerCase();
  const flagHeight = size * 0.75; // 4:3 ratio

  useEffect(() => {
    if (!useSvg) return;

    setSvgXml(null);

    if (!lowerCode) {
      setSvgXml(DEFAULT_FLAG_SVG);
      return;
    }

    fetchFlag(lowerCode).then(setSvgXml);
  }, [lowerCode, useSvg]);

  // ── Emoji mode ──────────────────────────────────────────
  if (!useSvg) {
    const emoji = countryCodeToFlagEmoji(isoCode) || '🏳️';
    return <Text style={{ fontSize: size * 0.75 }}>{emoji}</Text>;
  }

  // ── SVG loading placeholder ──────────────────────────────
  if (!svgXml) {
    return (
      <View
        testID="flag-placeholder" // Add this for Jest
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

  // ── SVG rendered ────────────────────────────────────────
  const xmlToRender = svgXml;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: flagHeight, borderRadius },
      ]}
    >
      <SvgXml xml={xmlToRender} width="100%" height="100%" />
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
});
