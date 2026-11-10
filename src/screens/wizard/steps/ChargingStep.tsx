import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import * as Battery from 'expo-battery';
import type { Subscription } from 'expo-battery';
import * as Haptics from 'expo-haptics';
import { BatteryCharging } from 'lucide-react-native';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';

/** Waits for the user to plug in a charger; passes automatically once detected. */
export default function ChargingStep({ onPass }: StepProps) {
  const [pct, setPct] = useState(0);
  const [charging, setCharging] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const passedRef = useRef(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    let levelSub: Subscription | null = null;
    let stateSub: Subscription | null = null;
    let mounted = true;

    const apply = (state: Battery.BatteryState) => {
      const isCharging =
        state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
      setCharging(isCharging);
      if (isCharging && !passedRef.current) {
        passedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(() => onPass(), 700);
      }
    };

    const refresh = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        if (!mounted) return;
        if (level >= 0) setPct(Math.round(level * 100));
        apply(state);
      } catch {
        // unsupported
      }
    };

    refresh();
    levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      if (batteryLevel >= 0) setPct(Math.round(batteryLevel * 100));
    });
    stateSub = Battery.addBatteryStateListener(({ batteryState }) => apply(batteryState));
    const poll = setInterval(refresh, 1500);

    return () => {
      mounted = false;
      levelSub?.remove();
      stateSub?.remove();
      clearInterval(poll);
    };
  }, [onPass]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const color = charging ? colors.success : colors.danger;

  return (
    <View style={styles.center}>
      <Animated.View style={[styles.iconRing, { borderColor: color, transform: [{ scale }] }]}>
        <BatteryCharging color={color} size={70} strokeWidth={1.8} />
      </Animated.View>
      <Text style={styles.pct}>{pct}%</Text>
      <Text style={[styles.msg, { color }]}>
        {charging
          ? '✔ تم الكشف: منفذ الشحن يعمل بكفاءة'
          : 'قم بتركيب الشاحن الآن لاختبار سوكت الطاقة'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  iconRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pct: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    marginTop: spacing.lg,
  },
  msg: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    writingDirection: 'rtl',
  },
});
