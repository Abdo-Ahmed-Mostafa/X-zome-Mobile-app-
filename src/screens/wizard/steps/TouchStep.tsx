import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';

const COLS = 6;
const ROWS = 14;
const TOTAL = COLS * ROWS;

/**
 * Full-area touch grid. Every cell must be swept to reach 100%, so any
 * unresponsive region is immediately visible as dark squares that never light.
 * The wizard's shared "توجد منطقة لا تستجيب ✗" button marks it failed.
 *
 * Accuracy: absolute measureInWindow + pageX/pageY so the lit cell is exactly
 * under the finger. Performance: per-cell Animated.Value, memoized cells,
 * single-cell animation per move (grid never re-renders).
 */
export default function TouchStep({ onPass }: StepProps) {
  const values = useRef<Animated.Value[]>(
    Array.from({ length: TOTAL }, () => new Animated.Value(0))
  ).current;

  const rect = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const gridRef = useRef<React.ComponentRef<typeof View>>(null);
  const litRef = useRef<Set<number>>(new Set());
  const passedRef = useRef(false);
  const [progress, setProgress] = useState(0);

  const measure = useCallback(() => {
    gridRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      rect.current = { x, y, w, h };
    });
  }, []);

  const mark = useCallback(
    (pageX: number, pageY: number) => {
      const { x, y, w, h } = rect.current;
      if (w === 0 || h === 0) return;
      const localX = pageX - x;
      const localY = pageY - y;
      if (localX < 0 || localY < 0 || localX > w || localY > h) return;

      const col = Math.min(COLS - 1, Math.max(0, Math.floor((localX / w) * COLS)));
      const row = Math.min(ROWS - 1, Math.max(0, Math.floor((localY / h) * ROWS)));
      const idx = row * COLS + col;
      if (litRef.current.has(idx)) return;

      litRef.current.add(idx);
      Animated.timing(values[idx], {
        toValue: 1,
        duration: 70,
        useNativeDriver: false,
      }).start();

      const pct = Math.round((litRef.current.size / TOTAL) * 100);
      setProgress((prev) => (prev !== pct ? pct : prev));

      // Require EVERY cell — a real full-screen touch test.
      if (!passedRef.current && litRef.current.size >= TOTAL) {
        passedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(onPass, 400);
      }
    },
    [onPass, values]
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          measure();
          mark(e.nativeEvent.pageX, e.nativeEvent.pageY);
        },
        onPanResponderMove: (e) => mark(e.nativeEvent.pageX, e.nativeEvent.pageY),
      }),
    [mark, measure]
  );

  return (
    <View style={styles.wrap}>
      {/* Grid fills the ENTIRE screen, edge to edge */}
      <View ref={gridRef} style={styles.grid} onLayout={measure} {...responder.panHandlers}>
        {values.map((v, i) => (
          <Cell key={i} value={v} />
        ))}
      </View>

      {/* Floating progress pill — overlays the grid, consumes no layout space */}
      <View style={styles.progressPill} pointerEvents="none">
        <Text style={[styles.progress, progress >= 100 && { color: colors.success }]}>
          {progress === 100 ? 'كل الشاشة تعمل ✔' : `تمت تغطية ${progress}%`}
        </Text>
      </View>
    </View>
  );
}

const Cell = React.memo(function Cell({ value }: { value: Animated.Value }) {
  const backgroundColor = value.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.success],
  });
  return <Animated.View style={[styles.cell, { backgroundColor }]} />;
});

const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%' },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / COLS}%`,
    height: `${100 / ROWS}%`,
    borderWidth: 1,
    borderColor: colors.bg,
  },
  progressPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(11,15,25,0.7)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  progress: {
    color: colors.neon,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
