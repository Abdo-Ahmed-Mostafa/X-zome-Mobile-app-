import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';
import { Wifi, WifiOff, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing } from '../../../theme/theme';
import { StepProps } from '../StepTypes';

const typeLabel: Record<string, string> = {
  WIFI: 'شبكة واي فاي',
  CELLULAR: 'بيانات الهاتف',
  ETHERNET: 'إيثرنت',
  VPN: 'شبكة VPN',
  BLUETOOTH: 'بلوتوث',
  NONE: 'لا يوجد اتصال',
  UNKNOWN: 'غير معروف',
};

/** Auto-checks the active network connection. */
export default function NetworkStep({ onPass, onFail }: StepProps) {
  const [label, setLabel] = useState('جارٍ فحص الاتصال…');
  const [connected, setConnected] = useState<boolean | null>(null);
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await Network.getNetworkStateAsync();
        if (!mounted) return;
        const isUp = !!st.isConnected;
        setConnected(isUp);
        setLabel(typeLabel[st.type ?? 'UNKNOWN'] ?? 'غير معروف');
        try {
          const addr = await Network.getIpAddressAsync();
          if (mounted) setIp(addr);
        } catch {
          // ip optional
        }
        if (isUp) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setTimeout(onPass, 1000);
        } else {
          setTimeout(onFail, 1200);
        }
      } catch {
        if (mounted) {
          setConnected(false);
          setLabel('تعذّر فحص الاتصال');
          setTimeout(onFail, 1200);
        }
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.center}>
      {connected === null ? (
        <Wifi color={colors.neon} size={110} strokeWidth={1.8} />
      ) : connected ? (
        <CheckCircle2 color={colors.success} size={110} strokeWidth={1.8} />
      ) : (
        <WifiOff color={colors.danger} size={110} strokeWidth={1.8} />
      )}
      <Text style={styles.msg}>
        {connected === null ? 'جارٍ فحص الاتصال…' : connected ? 'الاتصال يعمل بنجاح ✔' : 'لا يوجد اتصال بالشبكة'}
      </Text>
      <Text style={styles.detail}>نوع الاتصال: {label}</Text>
      {ip ? <Text style={styles.detail}>عنوان الـ IP: {ip}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  msg: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.xl,
    writingDirection: 'rtl',
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
    writingDirection: 'rtl',
  },
});
