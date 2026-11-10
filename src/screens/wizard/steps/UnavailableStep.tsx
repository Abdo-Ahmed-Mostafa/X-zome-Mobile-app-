import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LucideIcon, Info, SkipForward } from 'lucide-react-native';
import { colors, radius, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';

interface Props extends StepProps {
  icon: LucideIcon;
  label: string;
}

/**
 * Shown when a test can't run in the current environment (e.g. an audio test
 * inside Expo Go). Lets the user skip so the wizard keeps flowing.
 */
export default function UnavailableStep({ icon: Icon, label, onFail }: Props) {
  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Icon color={colors.textMuted} size={64} strokeWidth={1.8} />
      </View>
      <View style={styles.note}>
        <Info color={colors.amber} size={18} strokeWidth={2.2} />
        <Text style={styles.noteText}>{label}</Text>
      </View>
      <Pressable style={styles.skip} onPress={onFail}>
        <Text style={styles.skipText}>تخطّي هذا الفحص</Text>
        <SkipForward color={colors.bg} size={18} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  skip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  skipText: { color: colors.bg, fontSize: 15, fontWeight: '800', writingDirection: 'rtl' },
});
