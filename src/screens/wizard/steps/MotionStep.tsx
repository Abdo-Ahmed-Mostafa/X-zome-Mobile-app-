import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import * as Haptics from 'expo-haptics';
import { Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';
import { useSensorGuard } from './useSensorGuard';

const SHAKE_THRESHOLD = 1.8;

/** Shake-to-test the accelerometer. */
export default function MotionStep({ onPass, onFail }: StepProps) {
  const [passed, setPassed] = useState(false);
  const subRef = useRef<Subscription | null>(null);
  const lastMag = useRef(1);
  const passedRef = useRef(false);
  const bob = useRef(new Animated.Value(0)).current;
  const { unavailable, showHint } = useSensorGuard(Accelerometer, onFail, passedRef);

  useEffect(() => {
    if (passed) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bob, { toValue: -1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, passed]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const delta = Math.abs(mag - lastMag.current);
      lastMag.current = mag;
      if (delta > SHAKE_THRESHOLD && !passedRef.current) handlePass();
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

  const rotate = bob.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });

  if (unavailable) {
    return (
      <View style={styles.center}>
        <AlertTriangle color={colors.danger} size={100} strokeWidth={1.8} />
        <Text style={styles.msg}>مستشعر الحركة غير متوفر على هذا الجهاز</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      {passed ? (
        <CheckCircle2 color={colors.success} size={120} strokeWidth={1.8} />
      ) : (
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Smartphone color={colors.neon} size={120} strokeWidth={1.8} />
        </Animated.View>
      )}
      <Text style={styles.msg}>
        {passed ? 'المستشعر يستجيب بشكل سليم ✔' : 'قم بهز الهاتف لاختبار مستشعر الحركة'}
      </Text>
      {showHint && !passed && (
        <Text style={styles.hint}>لم يتم رصد حركة؟ هز الهاتف بقوة أكبر، أو اضغط زر الفشل بالأسفل</Text>
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
