import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Scale target while pressed. */
  scaleTo?: number;
  /** Fire a light haptic on press-in. */
  haptic?: boolean;
}

/**
 * A Pressable that gives tactile feedback: it springs down slightly on press
 * and bounces back on release, with an optional light haptic tap. Used across
 * the app so every tap feels responsive.
 */
export default function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn: PressableProps['onPressIn'] = (e) => {
    if (haptic) Haptics.selectionAsync().catch(() => {});
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    onPressIn?.(e);
  };

  const pressOut: PressableProps['onPressOut'] = (e) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} {...rest}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}
