import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, XCircle } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/theme';
import { InspectionReport, TestKey, TestStatus } from '../../types';
import { TEST_CATALOG, TEST_COUNT, TEST_CONFIG } from '../../data/testCatalog';
import { StepProps } from './StepTypes';
import ChargingStep from './steps/ChargingStep';
import TouchStep from './steps/TouchStep';
import PixelStep from './steps/PixelStep';
import MotionStep from './steps/MotionStep';
import GyroStep from './steps/GyroStep';
import CompassStep from './steps/CompassStep';
import VibrationStep from './steps/VibrationStep';
import SpeakerStep from './steps/SpeakerStep';
import MicStep from './steps/MicStep';
import NetworkStep from './steps/NetworkStep';

const STEP_COMPONENTS: Record<TestKey, React.ComponentType<StepProps>> = {
  charging: ChargingStep,
  touch: TouchStep,
  pixels: PixelStep,
  motion: MotionStep,
  gyroscope: GyroStep,
  compass: CompassStep,
  vibration: VibrationStep,
  speaker: SpeakerStep,
  microphone: MicStep,
  network: NetworkStep,
};

const emptyReport = (): InspectionReport =>
  TEST_CATALOG.reduce((acc, t) => {
    acc[t.key] = 'idle';
    return acc;
  }, {} as InspectionReport);

interface Props {
  visible: boolean;
  onCancel: () => void;
  onComplete: (results: InspectionReport) => void;
}

/**
 * Fullscreen sequential inspection. One test at a time. Every test ALWAYS
 * advances — whether it passed or the user marked it failed — so a broken
 * component (e.g. a dead charging port) never blocks seeing the rest.
 */
export default function InspectionWizard({ visible, onCancel, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const resultsRef = useRef<InspectionReport>(emptyReport());
  const fade = useRef(new Animated.Value(0)).current;
  const advancingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setIndex(0);
      resultsRef.current = emptyReport();
      advancingRef.current = false;
      fade.setValue(0);
      animateIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animateIn = () => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const current = TEST_CATALOG[index];

  const advance = (status: TestStatus) => {
    if (advancingRef.current) return; // guard double-advance
    advancingRef.current = true;

    const next = { ...resultsRef.current, [current.key]: status };
    resultsRef.current = next;

    if (index >= TEST_COUNT - 1) {
      onComplete(next);
      return;
    }
    Animated.timing(fade, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setIndex((i) => i + 1);
      advancingRef.current = false;
      animateIn();
    });
  };

  if (!visible) return null;

  const StepComponent = STEP_COMPONENTS[current.key];
  const cfg = TEST_CONFIG[current.key];
  const progress = (index + 1) / TEST_COUNT;
  const Icon = current.icon;

  // True-fullscreen tests (screen pixels / touch) take the entire display so
  // dead pixels or unresponsive areas at the very edges are visible. Only
  // minimal floating controls overlay the test.
  if (cfg.trueFullscreen) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
        <View style={styles.fsRoot}>
          <StepComponent
            key={current.key}
            onPass={() => advance('passed')}
            onFail={() => advance('failed')}
          />

          {/* Floating close (top) */}
          <Pressable
            onPress={onCancel}
            hitSlop={12}
            style={[styles.fsClose, { top: insets.top + spacing.sm }]}
          >
            <X color={colors.textPrimary} size={20} />
          </Pressable>

          {/* Floating fail (bottom) */}
          <Pressable
            onPress={() => advance('failed')}
            style={[styles.fsFail, { bottom: insets.bottom + spacing.lg }]}
          >
            <XCircle color={colors.danger} size={16} strokeWidth={2.4} />
            <Text style={styles.fsFailText}>{cfg.failLabel ?? 'فشل ✗'}</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={12} style={styles.closeBtn}>
            <X color={colors.textPrimary} size={22} />
          </Pressable>
          <Text style={styles.stepCount}>
            الفحص {index + 1} من {TEST_COUNT}
          </Text>
          <View style={styles.closeBtn} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Icon color={colors.neon} size={20} strokeWidth={2.3} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.desc}>{current.desc}</Text>
          </View>
        </View>

        {/* Step body */}
        <Animated.View style={[cfg.fullBleed ? styles.bodyFull : styles.body, { opacity: fade }]}>
          <StepComponent
            key={current.key}
            onPass={() => advance('passed')}
            onFail={() => advance('failed')}
          />
        </Animated.View>

        {/* Shared fail bar — lets the user flag a broken part and move on */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {!cfg.ownControls ? (
            <Pressable style={styles.failBtn} onPress={() => advance('failed')}>
              <XCircle color={colors.danger} size={18} strokeWidth={2.4} />
              <Text style={styles.failText}>{cfg.failLabel ?? 'فشل هذا الفحص ✗'}</Text>
            </Pressable>
          ) : (
            <View style={{ height: 4 }} />
          )}
          <Text style={styles.hint}>سجّل النتيجة وسينتقل الفحص للخطوة التالية تلقائيًا</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg },
  fsRoot: { flex: 1, backgroundColor: colors.bg },
  fsClose: {
    position: 'absolute',
    right: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  fsFail: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    zIndex: 20,
  },
  fsFailText: { color: colors.danger, fontSize: 13, fontWeight: '800', writingDirection: 'rtl' },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', writingDirection: 'rtl' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.neon },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  desc: { color: colors.textSecondary, fontSize: 13, marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  bodyFull: {
    flex: 1,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  failBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  failText: { color: colors.danger, fontSize: 14, fontWeight: '800', writingDirection: 'rtl' },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.sm,
    writingDirection: 'rtl',
  },
});
