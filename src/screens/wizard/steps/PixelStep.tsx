import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';

const SEQUENCE: { color: string; name: string; dark: boolean }[] = [
  { color: colors.pureRed, name: 'أحمر نقي', dark: false },
  { color: colors.pureGreen, name: 'أخضر نقي', dark: true },
  { color: colors.pureBlue, name: 'أزرق نقي', dark: false },
  { color: colors.pureWhite, name: 'أبيض', dark: true },
  { color: colors.pureBlack, name: 'أسود', dark: false },
];

/** Pure-color cycler for dead-pixel detection. Tap advances; passes at the end. */
export default function PixelStep({ onPass }: StepProps) {
  const [index, setIndex] = useState(0);
  const current = SEQUENCE[index];

  const advance = () => {
    Haptics.selectionAsync().catch(() => {});
    if (index >= SEQUENCE.length - 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onPass();
      return;
    }
    setIndex((i) => i + 1);
  };

  const fg = current.dark ? '#111' : '#fff';

  return (
    <Pressable style={[styles.fill, { backgroundColor: current.color }]} onPress={advance}>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.name, { color: fg }]}>{current.name}</Text>
        <Text style={[styles.counter, { color: fg }]}>
          {index + 1} / {SEQUENCE.length}
        </Text>
        <Text style={[styles.hint, { color: fg }]}>اضغط للانتقال للّون التالي</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  name: { fontSize: 34, fontWeight: '900', writingDirection: 'rtl' },
  counter: { fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  hint: { fontSize: 14, marginTop: spacing.lg, opacity: 0.85, writingDirection: 'rtl' },
});
