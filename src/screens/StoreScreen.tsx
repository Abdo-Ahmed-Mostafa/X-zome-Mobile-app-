import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Smartphone, HardDrive, ShieldCheck, MessageCircle, Tag, Info } from 'lucide-react-native';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import PressableScale from '../components/PressableScale';
import CreditFooter from '../components/CreditFooter';
import { colors, gradients, radius, shadow, spacing } from '../theme/theme';
import { STORE_PHONE } from '../theme/theme';
import { STORE_PHONES } from '../data/storeData';
import { StorePhone } from '../types';
import ProductDetail from './ProductDetail';

const accentOf = (a: StorePhone['accent']) =>
  a === 'neon' ? colors.neon : a === 'amber' ? colors.amber : colors.success;

const gradientOf = (a: StorePhone['accent']) =>
  a === 'neon' ? gradients.neon : a === 'amber' ? gradients.amber : gradients.success;

export default function StoreScreen() {
  const [selected, setSelected] = useState<StorePhone | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetails = (phone: StorePhone) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected(phone);
    setDetailOpen(true);
  };

  const openWhatsApp = async (phone: StorePhone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const msg =
      `مرحبًا متجر إكس زوم 👋\n` +
      `أرغب في الاستفسار / حجز الجهاز التالي:\n` +
      `📱 ${phone.name}\n` +
      `السعة: ${phone.storage}\n` +
      `الحالة: ${phone.condition}\n` +
      `السعر المعروض: ${phone.price.toLocaleString('en-US')} ج.م`;
    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;
    try {
      await Linking.openURL(url);
    } catch {
      // WhatsApp not installed / unsupported
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="متجر إكس زوم" subtitle="أحدث الأجهزة المستعملة والجديدة" />

      {STORE_PHONES.map((phone, i) => (
        <PhoneCard
          key={phone.id}
          phone={phone}
          delay={i * 60}
          onInquire={() => openWhatsApp(phone)}
          onDetails={() => openDetails(phone)}
        />
      ))}

      <CreditFooter />

      <ProductDetail phone={selected} visible={detailOpen} onClose={() => setDetailOpen(false)} />
    </ScreenContainer>
  );
}

function PhoneCard({
  phone,
  delay,
  onInquire,
  onDetails,
}: {
  phone: StorePhone;
  delay: number;
  onInquire: () => void;
  onDetails: () => void;
}) {
  const accent = accentOf(phone.accent);

  return (
    <Card delay={delay} gradient style={styles.card}>
      {/* Top: thumbnail + name + price */}
      <View style={styles.top}>
        <View style={[styles.thumb, { shadowColor: accent }]}>
          <LinearGradient
            colors={gradientOf(phone.accent)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.thumbGrad}
          >
            <Smartphone color={colors.bg} size={30} strokeWidth={2.2} />
          </LinearGradient>
        </View>

        <View style={styles.flex}>
          <Text style={styles.name} numberOfLines={1}>
            {phone.name}
          </Text>
          <Text style={styles.brand}>{phone.brand}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: accent }]}>
              {phone.price.toLocaleString('en-US')}
            </Text>
            <Text style={styles.currency}>ج.م</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        {phone.badges.map((b) => (
          <View key={b} style={styles.badge}>
            <Text style={styles.badgeText}>{b}</Text>
            <Tag color={accent} size={12} strokeWidth={2.4} />
          </View>
        ))}
      </View>

      {/* Specs strip */}
      <View style={styles.specStrip}>
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{phone.storage}</Text>
          <HardDrive color={colors.textSecondary} size={15} />
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{phone.condition}</Text>
          <ShieldCheck color={colors.textSecondary} size={15} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <PressableScale onPress={onInquire} haptic={false} style={styles.waWrap}>
          <LinearGradient
            colors={gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.waBtn, shadow.soft]}
          >
            <Text style={styles.waText}>واتساب</Text>
            <MessageCircle color={colors.bg} size={18} strokeWidth={2.4} />
          </LinearGradient>
        </PressableScale>
        <PressableScale onPress={onDetails} haptic style={styles.detailsBtn}>
          <View style={styles.detailsInner}>
            <Text style={styles.detailsText}>التفاصيل والمواصفات</Text>
            <Info color={colors.neon} size={17} strokeWidth={2.4} />
          </View>
        </PressableScale>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: spacing.md },
  top: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    ...shadow.soft,
  },
  thumbGrad: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  brand: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  price: { fontSize: 20, fontWeight: '900' },
  currency: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', writingDirection: 'rtl' },
  badges: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  specStrip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  specItem: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  specDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
  },
  specValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  waWrap: { flex: 1 },
  waBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  waText: { color: colors.bg, fontSize: 15, fontWeight: '900', writingDirection: 'rtl' },
  detailsBtn: { flex: 1 },
  detailsInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neonDeep,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    height: '100%',
  },
  detailsText: { color: colors.neon, fontSize: 14, fontWeight: '800', writingDirection: 'rtl' },
});
