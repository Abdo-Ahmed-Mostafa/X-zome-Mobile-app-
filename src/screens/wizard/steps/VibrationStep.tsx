import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Vibrate, Check, X } from 'lucide-react-native';
import { colors, radius, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';

/** Fires a vibration pattern, then asks the user to confirm they felt it. */
export default function VibrationStep({ onPass, onFail }: StepProps) {
  const [done, setDone] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const runPattern = async () => {
    setDone(false);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 80, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((r) => setTimeout(r, 180));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise((r) => setTimeout(r, 180));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // haptics unsupported
    }
    setDone(true);
  };

  useEffect(() => {
    runPattern();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-14, 14] });

  return (
    <View style={styles.center}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Vibrate color={colors.neon} size={110} strokeWidth={1.8} />
      </Animated.View>
      <Text style={styles.msg}>هل شعرت باهتزاز الهاتف؟</Text>

      {!done ? (
        <Text style={styles.running}>جارٍ تشغيل نمط الاهتزاز…</Text>
      ) : (
        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.yes]} onPress={onPass}>
            <Text style={styles.btnText}>نعم</Text>
            <Check color={colors.bg} size={18} strokeWidth={2.6} />
          </Pressable>
          <Pressable style={[styles.btn, styles.no]} onPress={onFail}>
            <Text style={styles.btnText}>لا</Text>
            <X color={colors.bg} size={18} strokeWidth={2.6} />
          </Pressable>
          <Pressable style={styles.repeat} onPress={runPattern}>
            <Text style={styles.repeatText}>إعادة</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  msg: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.xl,
    writingDirection: 'rtl',
  },
  running: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.lg, writingDirection: 'rtl' },
  actions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  btn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  yes: { backgroundColor: colors.success },
  no: { backgroundColor: colors.danger },
  btnText: { color: colors.bg, fontSize: 15, fontWeight: '800', writingDirection: 'rtl' },
  repeat: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  repeatText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', writingDirection: 'rtl' },
});
