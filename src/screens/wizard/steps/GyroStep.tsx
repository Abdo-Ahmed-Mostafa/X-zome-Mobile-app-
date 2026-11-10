import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import * as Haptics from 'expo-haptics';
import { RotateCw, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';
import { useSensorGuard } from './useSensorGuard';

const ROTATE_THRESHOLD = 2.5;

/** Rotate-to-test the gyroscope. */
export default function GyroStep({ onPass, onFail }: StepProps) {
  const [passed, setPassed] = useState(false);
  const subRef = useRef<Subscription | null>(null);
  const passedRef = useRef(false);
  const spin = useRef(new Animated.Value(0)).current;
  const { unavailable, showHint } = useSensorGuard(Gyroscope, onFail, passedRef);

  useEffect(() => {
    if (passed) return;
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin, passed]);

  useEffect(() => {
    Gyroscope.setUpdateInterval(100);
    const sub = Gyroscope.addListener(({ x, y, z }) => {
      if (
        !passedRef.current &&
        (Math.abs(x) > ROTATE_THRESHOLD || Math.abs(y) > ROTATE_THRESHOLD || Math.abs(z) > ROTATE_THRESHOLD)
      ) {
        handlePass();
      }
    });
    subRef.current = sub;
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePass = () => {
    passedRef.current = true;
    setPassed(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    subRef.current?.remove();
    setTimeout(onPass, 900);
  };

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (unavailable) {
    return (
      <View style={styles.center}>
        <AlertTriangle color={colors.danger} size={100} strokeWidth={1.8} />
        <Text style={styles.msg}>الجايروسكوب غير متوفر على هذا الجهاز</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      {passed ? (
        <CheckCircle2 color={colors.success} size={120} strokeWidth={1.8} />
      ) : (
        <Animated.View style={{ transform: [{ rotate }] }}>
          <RotateCw color={colors.neon} size={120} strokeWidth={1.8} />
        </Animated.View>
      )}
      <Text style={styles.msg}>
        {passed ? 'الجايروسكوب يستجيب بدقة ✔' : 'قم بتدوير الهاتف لاختبار الجايروسكوب'}
      </Text>
      {showHint && !passed && (
        <Text style={styles.hint}>لف الهاتف بشكل أوضح يمينًا ويسارًا، أو اضغط زر الفشل بالأسفل</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  msg: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    writingDirection: 'rtl',
  },
  hint: {
    color: colors.amber,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    writingDirection: 'rtl',
  },
});
