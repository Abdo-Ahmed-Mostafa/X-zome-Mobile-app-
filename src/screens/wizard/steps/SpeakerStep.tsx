import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Volume2, Check, X } from 'lucide-react-native';
import { colors, radius, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';
import { makeToneDataUri } from '../../../data/tone';
import { isAudioAvailable, getExpoAudio } from '../../../data/audioSafe';
import UnavailableStep from './UnavailableStep';

/** Plays a test tone through the loudspeaker, then asks the user to confirm. */
export default function SpeakerStep({ onPass, onFail }: StepProps) {
  // In Expo Go the native audio module is missing — skip gracefully.
  if (!isAudioAvailable()) {
    return (
      <UnavailableStep
        icon={Volume2}
        label="فحص السماعة يتطلب نسخة التطبيق المبنية (Development Build) وغير متاح داخل Expo Go."
        onPass={onPass}
        onFail={onFail}
      />
    );
  }
  return <SpeakerStepInner onPass={onPass} onFail={onFail} />;
}

function SpeakerStepInner({ onPass, onFail }: StepProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const wave = useRef(new Animated.Value(0)).current;

  const play = async () => {
    try {
      const ExpoAudio = getExpoAudio();
      if (!ExpoAudio) return;
      await ExpoAudio.setAudioModeAsync({ playsInSilentMode: true });
      if (!playerRef.current) {
        playerRef.current = ExpoAudio.createAudioPlayer(makeToneDataUri(), { updateInterval: 200 });
      }
      playerRef.current.seekTo(0);
      playerRef.current.volume = 1.0;
      playerRef.current.play();
      setPlaying(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wave, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
      setTimeout(() => setPlaying(false), 1400);
    } catch {
      setPlaying(false);
    }
  };

  useEffect(() => {
    play();
    return () => {
      try {
        playerRef.current?.remove();
      } catch {
        // already released
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scale = wave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const opacity = wave.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

  const pass = () => {
    Haptics.selectionAsync().catch(() => {});
    onPass();
  };

  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        {playing && <Animated.View style={[styles.halo, { opacity, transform: [{ scale }] }]} />}
        <Volume2 color={colors.neon} size={100} strokeWidth={1.8} />
      </View>
      <Text style={styles.msg}>هل سمعت نغمة الاختبار من السماعة؟</Text>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.yes]} onPress={pass}>
          <Text style={styles.btnText}>نعم</Text>
          <Check color={colors.bg} size={18} strokeWidth={2.6} />
        </Pressable>
        <Pressable style={[styles.btn, styles.no]} onPress={onFail}>
          <Text style={styles.btnText}>لا</Text>
          <X color={colors.bg} size={18} strokeWidth={2.6} />
        </Pressable>
        <Pressable style={styles.repeat} onPress={play}>
          <Text style={styles.repeatText}>إعادة التشغيل</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.neon,
  },
  msg: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  yes: { backgroundColor: colors.success },
  no: { backgroundColor: colors.danger },
  btnText: { color: colors.bg, fontSize: 15, fontWeight: '800', writingDirection: 'rtl' },
  repeat: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  repeatText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', writingDirection: 'rtl' },
});
