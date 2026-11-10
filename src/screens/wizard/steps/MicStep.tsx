import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Mic, MicOff, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';
import { isAudioAvailable, getExpoAudio } from '../../../data/audioSafe';
import UnavailableStep from './UnavailableStep';

// metering is in dBFS (negative). Louder = closer to 0.
const SOUND_THRESHOLD_DB = -35;

/** Records with live metering; passes when a loud-enough sound is detected. */
export default function MicStep({ onPass, onFail }: StepProps) {
  // In Expo Go the native audio module is missing — skip gracefully.
  if (!isAudioAvailable()) {
    return (
      <UnavailableStep
        icon={Mic}
        label="فحص الميكروفون يتطلب نسخة التطبيق المبنية (Development Build) وغير متاح داخل Expo Go."
        onPass={onPass}
        onFail={onFail}
      />
    );
  }
  return <MicStepInner onPass={onPass} onFail={onFail} />;
}

function MicStepInner({ onPass, onFail }: StepProps) {
  const ExpoAudio = getExpoAudio();
  const recorder = ExpoAudio.useAudioRecorder({
    ...ExpoAudio.RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const state = ExpoAudio.useAudioRecorderState(recorder, 100);
  const [denied, setDenied] = useState(false);
  const [passed, setPassed] = useState(false);
  const passedRef = useRef(false);
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { granted } = await ExpoAudio.requestRecordingPermissionsAsync();
        if (!mounted) return;
        if (!granted) {
          setDenied(true);
          return;
        }
        await ExpoAudio.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        failTimer.current = setTimeout(() => {
          if (!passedRef.current) finish(false);
        }, 12000);
      } catch {
        if (mounted) setDenied(true);
      }
    })();

    return () => {
      mounted = false;
      if (failTimer.current) clearTimeout(failTimer.current);
      try {
        recorder.stop();
      } catch {
        // not recording
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const level = state?.metering;
    if (passedRef.current || denied || level == null) return;
    if (level > SOUND_THRESHOLD_DB) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.metering, denied]);

  const finish = (ok: boolean) => {
    if (passedRef.current) return;
    passedRef.current = true;
    if (failTimer.current) clearTimeout(failTimer.current);
    try {
      recorder.stop();
    } catch {
      // ignore
    }
    if (ok) {
      setPassed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(onPass, 900);
    } else {
      onFail();
    }
  };

  const level = state?.metering ?? -60;
  const norm = Math.max(0, Math.min(1, (level + 60) / 60));

  if (denied) {
    return (
      <View style={styles.center}>
        <MicOff color={colors.danger} size={110} strokeWidth={1.8} />
        <Text style={styles.msg}>تم رفض إذن الميكروفون — لا يمكن إجراء الفحص</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      {passed ? (
        <CheckCircle2 color={colors.success} size={110} strokeWidth={1.8} />
      ) : (
        <Mic color={colors.neon} size={110} strokeWidth={1.8} />
      )}
      <Text style={styles.msg}>
        {passed ? 'تم التقاط الصوت بوضوح ✔' : 'تحدّث أو اصدر صوتًا بالقرب من الميكروفون'}
      </Text>

      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.round(norm * 100)}%` }]} />
      </View>
      <Text style={styles.level}>مستوى الصوت: {Math.round(norm * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  msg: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    writingDirection: 'rtl',
  },
  meterTrack: {
    width: '70%',
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surfaceAlt,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 7, backgroundColor: colors.success },
  level: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm, writingDirection: 'rtl' },
});
