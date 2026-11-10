import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow, spacing } from '../theme/theme';

interface Props extends ViewProps {
  /** Staggered entrance delay in ms. Kept small to avoid a late "pop-in". */
  delay?: number;
  /** Set false to render statically with no entrance animation. */
  animate?: boolean;
  /** Render a subtle gradient surface instead of a flat one. */
  gradient?: boolean;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

/**
 * Surface card with a quick, subtle entrance (fade + small rise) and an
 * optional gradient fill + soft shadow for a more premium feel.
 */
export default function Card({
  delay = 0,
  animate = true,
  gradient = false,
  style,
  children,
  ...rest
}: Props) {
  const anim = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: Math.min(delay, 160),
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [anim, delay, animate]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={[styles.wrap, shadow.card, { opacity: anim, transform: [{ translateY }] }, style]}
      {...rest}
    >
      {gradient ? (
        <LinearGradient
          colors={gradients.surface}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  fill: {
    // Negate the wrap padding so the gradient reaches the card edges,
    // then re-apply the padding inside.
    margin: -spacing.lg,
    padding: spacing.lg,
  },
});
