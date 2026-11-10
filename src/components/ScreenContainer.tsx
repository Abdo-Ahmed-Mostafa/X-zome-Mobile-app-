import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
}

/** Common padded container that leaves room for the floating navbar. */
export default function ScreenContainer({ children, scroll = true }: Props) {
  if (!scroll) {
    return <View style={styles.flex}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 150, // clearance for the floating navbar
  },
});
