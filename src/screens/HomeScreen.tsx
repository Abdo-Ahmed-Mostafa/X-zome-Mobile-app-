import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  Stethoscope,
  ShoppingBag,
  Zap,
  Smartphone,
  BadgeCheck,
  Star,
  ChevronLeft,
} from 'lucide-react-native';
import { buildDeviceProfile } from '../data/deviceProfile';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import PressableScale from '../components/PressableScale';
import LogoBadge from '../components/LogoBadge';
import CreditFooter from '../components/CreditFooter';
import { colors, gradients, radius, shadow, spacing } from '../theme/theme';
import { TabKey } from '../types';
import { STORE_PHONES } from '../data/storeData';

interface Props {
  onNavigate: (tab: TabKey) => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  const [deviceLabel, setDeviceLabel] = useState('جاري التعرف…');

  useEffect(() => {
    let mounted = true;
    buildDeviceProfile().then((p) => mounted && setDeviceLabel(p.title));
    return () => {
      mounted = false;
    };
  }, []);

  const cheapest = [...STORE_PHONES].sort((a, b) => a.price - b.price)[0];

  return (
    <ScreenContainer>
      {/* Gradient hero */}
      <Card delay={0} animate style={styles.heroCard}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGrad}
        >
          <LogoBadge size={88} />
          <Text style={styles.brand}>X ZOOM</Text>
          <Text style={styles.brandAr}>إكس زوم للاتصالات والهواتف الذكية</Text>
          <Text style={styles.heroBanner}>
            فحص عتاد معتمد وتسوّق أحدث الأجهزة المستعملة والجديدة بأفضل تسعير
          </Text>
        </LinearGradient>
      </Card>

      {/* Stats strip */}
      <View style={styles.stats}>
        <StatPill delay={80} icon={Smartphone} value={`${STORE_PHONES.length}+`} label="جهاز متاح" />
        <StatPill delay={120} icon={Stethoscope} value="10" label="فحوصات دقيقة" />
        <StatPill delay={160} icon={BadgeCheck} value="100%" label="ضمان محلي" />
      </View>

      {/* Current device */}
      <Card delay={200} gradient style={styles.deviceCard}>
        <View style={styles.deviceRow}>
          <View style={styles.deviceIcon}>
            <Zap color={colors.neon} size={22} strokeWidth={2.4} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.deviceLabel}>جهازك الحالي</Text>
            <Text style={styles.deviceValue} numberOfLines={1}>
              {deviceLabel}
            </Text>
          </View>
        </View>
      </Card>

      {/* Feature tiles */}
      <View style={styles.tiles}>
        <FeatureTile
          delay={240}
          grad={gradients.neon}
          icon={<Stethoscope color={colors.bg} size={26} strokeWidth={2.3} />}
          title="فحص معتمد"
          desc="تشخيص شامل للعتاد"
          onPress={() => onNavigate('diagnostics')}
        />
        <FeatureTile
          delay={290}
          grad={gradients.amber}
          icon={<ShoppingBag color={colors.bg} size={26} strokeWidth={2.3} />}
          title="متجر الأجهزة"
          desc="أحدث الموديلات"
          onPress={() => onNavigate('store')}
        />
      </View>

      {/* Offer teaser */}
      <Text style={styles.sectionTitle}>عرض اليوم</Text>
      <PressableScale onPress={() => onNavigate('store')} haptic={false}>
        <Card delay={330} gradient style={styles.offerCard}>
          <ChevronLeft color={colors.textMuted} size={22} />
          <View style={styles.flex}>
            <View style={styles.offerBadge}>
              <Star color={colors.amber} size={12} strokeWidth={2.6} fill={colors.amber} />
              <Text style={styles.offerBadgeText}>أفضل سعر</Text>
            </View>
            <Text style={styles.offerName}>{cheapest.name}</Text>
            <Text style={styles.offerPrice}>
              {cheapest.price.toLocaleString('en-US')} ج.م
            </Text>
          </View>
          <View style={styles.offerThumb}>
            <Smartphone color={colors.amber} size={28} strokeWidth={2} />
          </View>
        </Card>
      </PressableScale>

      <CreditFooter />
    </ScreenContainer>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: typeof Zap;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <Card delay={delay} style={styles.statCard}>
      <Icon color={colors.neon} size={20} strokeWidth={2.3} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function FeatureTile({
  icon,
  title,
  desc,
  delay,
  grad,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
  grad: readonly [string, string, ...string[]];
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} haptic style={styles.tileWrap}>
      <Card delay={delay} style={styles.tile}>
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.tileIcon, shadow.soft]}
        >
          {icon}
        </LinearGradient>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileDesc}>{desc}</Text>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heroCard: { padding: 0, overflow: 'hidden', borderColor: colors.neonDeep },
  heroGrad: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 5,
    marginTop: spacing.sm,
  },
  brandAr: {
    color: colors.neon,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  heroBanner: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.lg,
    writingDirection: 'rtl',
  },
  stats: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 4,
  },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.textSecondary, fontSize: 11, writingDirection: 'rtl', textAlign: 'center' },
  deviceCard: { marginTop: spacing.md },
  deviceRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'right', writingDirection: 'rtl' },
  deviceValue: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  tiles: { flexDirection: 'row-reverse', gap: spacing.md, marginTop: spacing.md },
  tileWrap: { flex: 1 },
  tile: { alignItems: 'center', paddingVertical: spacing.lg },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  tileDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    writingDirection: 'rtl',
  },
  offerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: colors.amberDeep,
  },
  offerBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    marginBottom: 6,
  },
  offerBadgeText: { color: colors.amber, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  offerName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  offerPrice: {
    color: colors.amber,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  offerThumb: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
