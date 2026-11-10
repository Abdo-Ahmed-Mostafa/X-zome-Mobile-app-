import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MemoryStick,
  MonitorSmartphone,
  Cpu,
  HardDrive,
  Factory,
  Smartphone,
  Monitor,
  Ruler,
  Database,
  Camera,
  BatteryCharging,
  Gauge,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Usb,
  Nfc,
  LucideIcon,
} from 'lucide-react-native';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import CreditFooter from '../components/CreditFooter';
import { colors, gradients, radius, shadow, spacing } from '../theme/theme';
import * as Device from 'expo-device';
import { buildDeviceProfile, DeviceProfile } from '../data/deviceProfile';
import { fetchLiveSpec, LiveSpec, lastSpecError } from '../data/specsApi';
import { buildSpecQueries } from '../data/modelCodeMap';

interface SpecItem {
  icon: LucideIcon;
  label: string;
  value: string;
  grad: readonly [string, string, ...string[]];
  wide?: boolean;
}

type RefState = 'loading' | 'ready' | 'none';

export default function SpecsScreen() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [spec, setSpec] = useState<LiveSpec | null>(null);
  const [refState, setRefState] = useState<RefState>('loading');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    buildDeviceProfile().then(async (p) => {
      if (!mounted) return;
      setProfile(p);

      // Derive the best search queries from the model code/name. Android
      // reports a bare code (e.g. SM-A366B) that the API can't match, so we
      // translate it to the commercial name ("Galaxy A36") first.
      const queries = buildSpecQueries(
        Device.modelName ?? Device.modelId,
        Device.modelName,
        p.manufacturer
      );
      // Always also try the profile title as a last resort.
      if (!queries.includes(p.title)) queries.push(p.title);
      let found: LiveSpec | null = null;
      for (const q of queries) {
        found = await fetchLiveSpec(q);
        if (found) break;
      }
      if (!mounted) return;
      setSpec(found);
      setErrMsg(found ? null : lastSpecError);
      setRefState(found ? 'ready' : 'none');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const telemetry: SpecItem[] = profile
    ? [
        { icon: MemoryStick, label: 'الذاكرة (RAM)', value: profile.ram, grad: gradients.neon },
        { icon: HardDrive, label: 'التخزين الكلي', value: profile.storage, grad: gradients.amber },
        { icon: Database, label: 'المساحة المتاحة', value: profile.storageFree, grad: gradients.success },
        { icon: Monitor, label: 'دقة الشاشة', value: profile.resolution, grad: gradients.neon },
        { icon: Ruler, label: 'حجم الشاشة', value: profile.screenSize, grad: gradients.amber },
        { icon: MonitorSmartphone, label: 'نظام التشغيل', value: profile.os, grad: gradients.success },
        { icon: Factory, label: 'الشركة المصنّعة', value: profile.manufacturer, grad: gradients.neon },
        { icon: Smartphone, label: 'نوع الجهاز', value: profile.typeLabel, grad: gradients.amber },
      ]
    : [];

  // All reference rows are full-width so they align uniformly top-to-bottom.
  const reference: SpecItem[] = spec
    ? ([
        spec.chipset && { icon: Cpu, label: 'المعالج', value: spec.chipset, grad: gradients.neon, wide: true },
        spec.cpu && { icon: Cpu, label: 'أنوية المعالج', value: spec.cpu, grad: gradients.amber, wide: true },
        spec.gpu && { icon: Gauge, label: 'معالج الرسوميات', value: spec.gpu, grad: gradients.success, wide: true },
        spec.displayType && { icon: Monitor, label: 'نوع الشاشة', value: spec.displayType, grad: gradients.neon, wide: true },
        spec.displayResolution && { icon: Ruler, label: 'دقة الشاشة', value: spec.displayResolution, grad: gradients.amber, wide: true },
        spec.displayProtection && { icon: ShieldCheck, label: 'حماية الشاشة', value: spec.displayProtection, grad: gradients.success, wide: true },
        spec.mainCamera && { icon: Camera, label: 'الكاميرا الخلفية', value: spec.mainCamera, grad: gradients.neon, wide: true },
        spec.selfieCamera && { icon: Camera, label: 'الكاميرا الأمامية', value: spec.selfieCamera, grad: gradients.amber, wide: true },
        spec.videoCapabilities && { icon: Camera, label: 'تصوير الفيديو', value: spec.videoCapabilities, grad: gradients.success, wide: true },
        spec.battery && { icon: BatteryCharging, label: 'البطارية', value: spec.battery, grad: gradients.neon, wide: true },
        spec.charging && { icon: BatteryCharging, label: 'الشحن', value: spec.charging, grad: gradients.amber, wide: true },
        spec.usb && { icon: Usb, label: 'منفذ الشحن', value: spec.usb, grad: gradients.success, wide: true },
      ].filter(Boolean) as SpecItem[])
    : [];

  return (
    <ScreenContainer>
      <ScreenHeader title="مواصفات جهازي" subtitle="قراءة مباشرة + مواصفات مرجعية حيّة" />

      {/* Hero device card */}
      <Card delay={0} style={styles.heroCard}>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGrad}>
          <LinearGradient colors={gradients.neon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.heroIcon, shadow.neon]}>
            <Smartphone color={colors.bg} size={34} strokeWidth={2.2} />
          </LinearGradient>
          <Text style={styles.heroName} numberOfLines={2}>
            {spec?.model ?? profile?.title ?? 'جارِ التعرف على الجهاز…'}
          </Text>
          <Text style={styles.heroSub}>{spec?.releaseDate ?? profile?.typeLabel ?? ''}</Text>

          {profile && (
            <View style={[styles.realBadge, { borderColor: profile.isPhysical ? colors.success : colors.amber }]}>
              {profile.isPhysical ? (
                <CheckCircle2 color={colors.success} size={14} strokeWidth={2.4} />
              ) : (
                <FlaskConical color={colors.amber} size={14} strokeWidth={2.4} />
              )}
              <Text style={[styles.realText, { color: profile.isPhysical ? colors.success : colors.amber }]}>
                {profile.isPhysical ? 'جهاز حقيقي' : 'محاكي / Emulator'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Card>

      {/* Live telemetry */}
      <SectionTitle icon={Gauge} text="بيانات العتاد اللحظية" />
      <View style={styles.grid}>
        {telemetry.map((item, i) => (
          <SpecCard key={item.label} item={item} delay={60 + i * 40} />
        ))}
      </View>

      {/* Reference specs from the live API */}
      <SectionTitle icon={Database} text="المواصفات المرجعية" />
      {refState === 'loading' && (
        <Card delay={60} style={styles.loading}>
          <ActivityIndicator color={colors.neon} />
          <Text style={styles.loadingText}>جارِ جلب المواصفات الكاملة…</Text>
        </Card>
      )}

      {refState === 'ready' && (
        <>
          <View style={styles.grid}>
            {reference.map((item, i) => (
              <SpecCard key={item.label} item={item} delay={60 + i * 30} />
            ))}
          </View>
          <View style={styles.chips}>
            {spec?.has5g != null && <ConnChip ok={spec.has5g} label="5G" />}
            {spec?.nfc != null && <ConnChip ok={spec.nfc} label="NFC" />}
            {spec?.jack35 != null && <ConnChip ok={spec.jack35} label="مدخل 3.5" />}
            {spec?.cardSlot != null && <ConnChip ok={spec.cardSlot} label="كارت ذاكرة" />}
            {spec?.ipRating && <ConnChip ok label={spec.ipRating} neutral />}
          </View>
          <Text style={styles.sourceNote}>المصدر: قاعدة بيانات GSMArena (حيّة)</Text>
        </>
      )}

      {refState === 'none' && (
        <Card delay={60} style={styles.loading}>
          <Database color={colors.textMuted} size={26} strokeWidth={1.8} />
          <Text style={styles.loadingText}>تعذّر جلب المواصفات المرجعية</Text>
          {errMsg ? <Text style={styles.errDetail}>{errMsg}</Text> : null}
        </Card>
      )}

      <CreditFooter />
    </ScreenContainer>
  );
}

function SectionTitle({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionText}>{text}</Text>
      <Icon color={colors.neon} size={18} strokeWidth={2.3} />
    </View>
  );
}

function SpecCard({ item, delay }: { item: SpecItem; delay: number }) {
  const Icon = item.icon;

  // Full-width rows render horizontally (icon on the side) so they stay compact
  // and uniformly aligned regardless of value length.
  if (item.wide) {
    return (
      <Card delay={delay} gradient style={styles.rowCard}>
        <LinearGradient colors={item.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.specIconRow, shadow.soft]}>
          <Icon color={colors.bg} size={20} strokeWidth={2.3} />
        </LinearGradient>
        <View style={styles.flex}>
          <Text style={styles.specLabel}>{item.label}</Text>
          <Text style={styles.specValue}>{item.value}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card delay={delay} gradient style={styles.specCard}>
      <LinearGradient colors={item.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.specIcon, shadow.soft]}>
        <Icon color={colors.bg} size={20} strokeWidth={2.3} />
      </LinearGradient>
      <Text style={styles.specLabel}>{item.label}</Text>
      <Text style={styles.specValue} numberOfLines={3}>
        {item.value}
      </Text>
    </Card>
  );
}

function ConnChip({ ok, label, neutral }: { ok: boolean; label: string; neutral?: boolean }) {
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
  heroCard: { padding: 0, overflow: 'hidden', borderColor: colors.neonDeep },
  heroGrad: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  heroIcon: { width: 72, height: 72, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  heroName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.lg,
    writingDirection: 'rtl',
  },
  heroSub: { color: colors.textSecondary, fontSize: 13, marginTop: 4, writingDirection: 'rtl' },
  realBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  realText: { fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  sectionTitle: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: colors.neon },
  sectionText: { color: colors.textPrimary, fontSize: 16, fontWeight: '900', writingDirection: 'rtl' },
  flex: { flex: 1 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between' },
  specCard: { width: '48%', minHeight: 124, marginBottom: spacing.md },
  specIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  rowCard: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  specIconRow: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'right', writingDirection: 'rtl' },
  specValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
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
  sourceNote: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.md,
    writingDirection: 'rtl',
  },
  loading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  loadingText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', writingDirection: 'rtl' },
  errDetail: { color: colors.danger, fontSize: 12, textAlign: 'center', writingDirection: 'rtl' },
});
