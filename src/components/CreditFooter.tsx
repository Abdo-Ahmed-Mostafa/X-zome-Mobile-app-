import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Code2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/theme';
import { DEV_CREDIT } from '../theme/theme';

/** Persistent developer copyright pill badge. */
export default function CreditFooter() {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Text style={styles.text}>{DEV_CREDIT}</Text>
        <Code2 color={colors.neon} size={16} strokeWidth={2.2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  pill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neonDeep,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
