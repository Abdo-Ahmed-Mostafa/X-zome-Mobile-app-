import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  X,
  Cpu,
  Monitor,
  Camera,
  BatteryCharging,
  ShieldCheck,
  Gauge,
  Usb,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Tag,
  LucideIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import PressableScale from '../components/PressableScale';
import { colors, gradients, radius, shadow, spacing, STORE_PHONE } from '../theme/theme';
import { StorePhone } from '../types';
import { fetchLiveSpec, LiveSpec } from '../data/specsApi';

interface Props {
  phone: StorePhone | null;
  visible: boolean;
  onClose: () => void;
}

type State = 'loading' | 'ready' | 'none';

interface Row {
  icon: LucideIcon;
  label: string;
  value: string;
}

/** Product detail sheet: live GSMArena specs + image + WhatsApp inquiry. */
export default function ProductDetail({ phone, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [spec, setSpec] = useState<LiveSpec | null>(null);
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!visible || !phone) return;
    let mounted = true;
    setState('loading');
    setSpec(null);
    fetchLiveSpec(phone.specQuery ?? phone.name).then((s) => {
      if (!mounted) return;
      setSpec(s);
      setState(s ? 'ready' : 'none');
    });
    return () => {
      mounted = false;
    };
  }, [visible, phone]);

  if (!phone) return null;

  const openWhatsApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const msg =
      `مرحبًا متجر إكس زوم 👋\n` +
      `أرغب في حجز / الاستفسار عن:\n` +
      `📱 ${phone.name}\n` +
      `السعة: ${phone.storage}\n` +
      `الحالة: ${phone.condition}\n` +
      `السعر: ${phone.price.toLocaleString('en-US')} ج.م`;
    try {
      await Linking.openURL(`https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`);
    } catch {
      // ignore
    }
  };

  const rows: Row[] = spec
    ? ([
        spec.chipset && { icon: Cpu, label: 'المعالج', value: spec.chipset },
        spec.displayType && { icon: Monitor, label: 'الشاشة', value: spec.displayType },
        spec.displayResolution && { icon: Gauge, label: 'الدقة', value: spec.displayResolution },
        spec.mainCamera && { icon: Camera, label: 'الكاميرا الخلفية', value: spec.mainCamera },
        spec.selfieCamera && { icon: Camera, label: 'الكاميرا الأمامية', value: spec.selfieCamera },
        spec.battery && { icon: BatteryCharging, label: 'البطارية', value: spec.battery },
        spec.charging && { icon: BatteryCharging, label: 'الشحن', value: spec.charging },
        spec.displayProtection && { icon: ShieldCheck, label: 'الحماية', value: spec.displayProtection },
        spec.usb && { icon: Usb, label: 'منفذ الشحن', value: spec.usb },
      ].filter(Boolean) as Row[])
    : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X color={colors.textPrimary} size={22} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {phone.name}
          </Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image */}
          <Card delay={0} style={styles.heroCard}>
            <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGrad}>
              {spec?.imageUrl ? (
                <Image source={{ uri: spec.imageUrl }} style={styles.heroImg} resizeMode="contain" />
              ) : (
                <View style={styles.heroImgPlaceholder}>
                  <ActivityIndicator color={colors.neon} />
                </View>
              )}
              <Text style={styles.heroName}>{phone.name}</Text>
              {spec?.releaseDate ? <Text style={styles.heroSub}>{spec.releaseDate}</Text> : null}
            </LinearGradient>
          </Card>

          {/* Badges + price */}
          <View style={styles.badges}>
            {phone.badges.map((b) => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
                <Tag color={colors.amber} size={12} strokeWidth={2.4} />
              </View>
            ))}
          </View>
          <Card delay={60} gradient style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>السعر داخل المتجر</Text>
              <Text style={styles.priceValue}>{phone.price.toLocaleString('en-US')} ج.م</Text>
            </View>
            <View style={styles.condBox}>
              <Text style={styles.condText}>{phone.condition}</Text>
              <Text style={styles.condStorage}>{phone.storage}</Text>
            </View>
          </Card>

          {/* Specs */}
          <Text style={styles.sectionTitle}>المواصفات التقنية</Text>
          {state === 'loading' && (
            <Card delay={0} style={styles.loading}>
              <ActivityIndicator color={colors.neon} />
              <Text style={styles.loadingText}>جارِ جلب المواصفات…</Text>
            </Card>
          )}
          {state === 'ready' &&
            rows.map((r, i) => (
              <Card key={r.label} delay={i * 30} style={styles.specRow}>
                <View style={styles.specIcon}>
                  <r.icon color={colors.neon} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.specLabel}>{r.label}</Text>
                  <Text style={styles.specValue}>{r.value}</Text>
                </View>
              </Card>
            ))}
          {state === 'ready' && (
            <View style={styles.chips}>
              {spec?.has5g != null && <Chip ok={spec.has5g} label="5G" />}
              {spec?.nfc != null && <Chip ok={spec.nfc} label="NFC" />}
              {spec?.jack35 != null && <Chip ok={spec.jack35} label="مدخل 3.5" />}
              {spec?.cardSlot != null && <Chip ok={spec.cardSlot} label="كارت ذاكرة" />}
              {spec?.ipRating && <Chip ok label={spec.ipRating} neutral />}
            </View>
          )}
          {state === 'none' && (
            <Card delay={0} style={styles.loading}>
              <Text style={styles.loadingText}>تعذّر جلب المواصفات التقنية لهذا الجهاز حاليًا</Text>
            </Card>
          )}
        </ScrollView>

        {/* Sticky WhatsApp CTA */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PressableScale onPress={openWhatsApp} haptic={false}>
            <LinearGradient colors={gradients.success} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.waBtn, shadow.soft]}>
              <Text style={styles.waText}>حجز أو استفسار عبر واتساب</Text>
              <MessageCircle color={colors.bg} size={18} strokeWidth={2.4} />
            </LinearGradient>
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}

function Chip({ ok, label, neutral }: { ok: boolean; label: string; neutral?: boolean }) {
  const color = neutral ? colors.neon : ok ? colors.success : colors.danger;
  return (
    <View style={[styles.chip, { borderColor: color }]}>
      {neutral ? (
        <ShieldCheck color={color} size={13} strokeWidth={2.5} />
      ) : ok ? (
        <CheckCircle2 color={color} size={13} strokeWidth={2.5} />
      ) : (
        <XCircle color={color} size={13} strokeWidth={2.5} />
      )}
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg },
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
  headerTitle: { flex: 1, color: colors.textPrimary, fontSize: 16, fontWeight: '900', textAlign: 'center', writingDirection: 'rtl' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  heroCard: { padding: 0, overflow: 'hidden', borderColor: colors.neonDeep },
  heroGrad: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  heroImg: { width: 160, height: 200 },
  heroImgPlaceholder: { width: 160, height: 200, alignItems: 'center', justifyContent: 'center' },
  heroName: { color: colors.textPrimary, fontSize: 18, fontWeight: '900', marginTop: spacing.md, textAlign: 'center', writingDirection: 'rtl' },
  heroSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4, writingDirection: 'rtl' },
  badges: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  badgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700', writingDirection: 'rtl' },
  priceCard: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  priceLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'right', writingDirection: 'rtl' },
  priceValue: { color: colors.amber, fontSize: 22, fontWeight: '900', marginTop: 2, writingDirection: 'rtl' },
  condBox: { alignItems: 'center' },
  condText: { color: colors.textPrimary, fontSize: 13, fontWeight: '800', writingDirection: 'rtl' },
  condStorage: { color: colors.textSecondary, fontSize: 12, marginTop: 2, writingDirection: 'rtl' },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    writingDirection: 'rtl',
  },
  specRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  specIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'right', writingDirection: 'rtl' },
  specValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
  },
  chipText: { fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  loading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  loadingText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', writingDirection: 'rtl' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  waBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  waText: { color: colors.bg, fontSize: 15, fontWeight: '900', writingDirection: 'rtl' },
});
