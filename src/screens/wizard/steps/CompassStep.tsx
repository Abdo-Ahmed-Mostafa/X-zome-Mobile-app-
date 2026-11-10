import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import * as Haptics from 'expo-haptics';
import { Compass, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';
import { useSensorGuard } from './useSensorGuard';

/** Live magnetometer heading; passes once most directions are swept. */
export default function CompassStep({ onPass, onFail }: StepProps) {
  const [heading, setHeading] = useState(0);
  const [coverage, setCoverage] = useState(0);
  const [passed, setPassed] = useState(false);
  const subRef = useRef<Subscription | null>(null);
  const seen = useRef<Set<number>>(new Set());
  const passedRef = useRef(false);
  const { unavailable, showHint } = useSensorGuard(Magnetometer, onFail, passedRef);

  useEffect(() => {
    Magnetometer.setUpdateInterval(120);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
      const bucket = Math.floor(angle / 30);
      if (!seen.current.has(bucket)) {
        seen.current.add(bucket);
        setCoverage(Math.round((seen.current.size / 12) * 100));
        if (!passedRef.current && seen.current.size >= 9) {
          passedRef.current = true;
          setPassed(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setTimeout(onPass, 900);
        }
      }
    });
    subRef.current = sub;
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (unavailable) {
    return (
      <View style={styles.center}>
        <AlertTriangle color={colors.danger} size={100} strokeWidth={1.8} />
        <Text style={styles.msg}>المستشعر المغناطيسي غير متوفر على هذا الجهاز</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={[styles.cov, passed && { color: colors.success }]}>{coverage}%</Text>
      {passed ? (
        <CheckCircle2 color={colors.success} size={120} strokeWidth={1.8} />
      ) : (
        <View style={{ transform: [{ rotate: `${-heading}deg` }] }}>
          <Compass color={colors.neon} size={130} strokeWidth={1.6} />
        </View>
      )}
      <Text style={styles.msg}>
        {passed ? 'المستشعر المغناطيسي يعمل بدقة ✔' : 'لف الهاتف في جميع الاتجاهات'}
      </Text>
      {showHint && !passed && (
        <Text style={styles.hint}>استمر في لف الهاتف ببطء في كل الاتجاهات، أو اضغط زر الفشل بالأسفل</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  cov: { color: colors.neon, fontSize: 22, fontWeight: '900', marginBottom: spacing.lg },
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
