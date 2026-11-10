import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow } from '../theme/theme';

interface Props {
  size?: number;
  style?: ViewStyle;
}

/**
 * X ZOOM wordmark emblem: a monogram "X" set in a gradient squircle with a
 * soft neon glow. Clean and brand-like — no pulsing, no generic phone icon.
 */
export default function LogoBadge({ size = 92, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={gradients.neon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          shadow.neon,
          { width: size, height: size, borderRadius: size * 0.28 },
        ]}
      >
        {/* Subtle inner sheen */}
        <View style={[styles.sheen, { borderRadius: size * 0.28 }]} />
        <Text style={[styles.mono, { fontSize: size * 0.56 }]}>X</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  mono: {
    color: colors.bg,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: -2,
  },
});
