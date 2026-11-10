import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Cpu, Stethoscope, Store, LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadow, spacing } from '../theme/theme';
import { TabKey } from '../types';

interface TabDef {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

// Order defined right-to-left to match the RTL layout.
const TABS: TabDef[] = [
  { key: 'home', label: 'الرئيسية', icon: Home },
  { key: 'specs', label: 'جهازي', icon: Cpu },
  { key: 'diagnostics', label: 'الفحص', icon: Stethoscope },
  { key: 'store', label: 'المتجر', icon: Store },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

/**
 * Pill-style bottom bar. The active tab expands into a neon capsule that shows
 * its label; inactive tabs are just centered icons. Each item animates itself
 * (no shared sliding indicator, so nothing can misalign), and the only animated
 * properties are opacity + scale on the native driver — light and jitter-free.
 */
export default function FloatingNavBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  const handlePress = (key: TabKey) => {
    if (key !== active) {
      Haptics.selectionAsync().catch(() => {});
      onChange(key);
    }
  };

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, shadow.card]}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={styles.item}
            onPress={() => handlePress(tab.key)}
            hitSlop={6}
          >
            <NavItem active={tab.key === active} Icon={tab.icon} label={tab.label} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function NavItem({ active, Icon, label }: { active: boolean; Icon: LucideIcon; label: string }) {
  // Drives the neon capsule behind the active item (opacity + subtle scale).
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [active, anim]);

  const capsuleOpacity = anim;
  const capsuleScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  const tint = active ? colors.bg : colors.textSecondary;

  return (
    <View style={styles.itemInner}>
      {/* Neon capsule background — fades/scales in for the active tab only */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.capsule,
          active && shadow.neon,
          { opacity: capsuleOpacity, transform: [{ scale: capsuleScale }] },
        ]}
      />
      <View style={styles.row}>
        <Icon color={tint} size={21} strokeWidth={active ? 2.6 : 2} />
        {active && (
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const PILL_H = 48;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(19,27,46,0.98)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    width: '100%',
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.neon,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  label: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
