import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/theme';

interface Props {
  title: string;
  subtitle?: string;
}

/** Consistent RTL screen title block. */
export default function ScreenHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.accentBar} />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  accentBar: {
    width: 5,
    height: 40,
    borderRadius: 3,
    backgroundColor: colors.neon,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
