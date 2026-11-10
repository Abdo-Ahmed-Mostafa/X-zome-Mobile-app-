import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LogoBadge from '../components/LogoBadge';
import { colors, gradients, spacing } from '../theme/theme';

interface Props {
  onFinish: () => void;
}

/** First-launch brand reveal with a gradient backdrop. Auto-dismisses ~2.2s. */
export default function SplashScreen({ onFinish }: Props) {
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoRise = useRef(new Animated.Value(20)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRise, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textFade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 420,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && onFinish());
  }, [logoFade, logoRise, textFade, barWidth, screenFade, onFinish]);

  const barFill = barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.root, { opacity: screenFade }]}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      >
        <Animated.View
          style={{ opacity: logoFade, transform: [{ translateY: logoRise }], alignItems: 'center' }}
        >
          <LogoBadge size={104} />
        </Animated.View>

        <Animated.View style={{ opacity: textFade, alignItems: 'center' }}>
          <Text style={styles.brand}>
            X <Text style={styles.brandNeon}>ZOOM</Text>
          </Text>
          <Text style={styles.brandAr}>إكس زوم للاتصالات والهواتف الذكية</Text>
        </Animated.View>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barFill }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  grad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: spacing.xl,
  },
  brandNeon: {
    color: colors.neon,
  },
  brandAr: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  barTrack: {
    width: 160,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: spacing.xxl,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.neon,
  },
});
