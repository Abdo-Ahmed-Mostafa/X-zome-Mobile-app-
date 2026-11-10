import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCircle2, XCircle, RotateCcw } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/theme';
import { InspectionRecord } from '../types';
import { TEST_CATALOG } from '../data/testCatalog';
import { formatDate } from '../data/scoring';

interface Props {
  visible: boolean;
  record: InspectionRecord | null;
  onClose: () => void;
  onRescan?: () => void;
}

/** Full inspection report — used for a fresh result and for history items. */
export default function ReportView({ visible, record, onClose, onRescan }: Props) {
  const insets = useSafeAreaInsets();
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      ring.setValue(0.8);
      Animated.spring(ring, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }
  }, [visible, ring]);

  if (!record) return null;

  const scoreColor =
    record.score >= 75 ? colors.success : record.score >= 50 ? colors.amber : colors.danger;
  const passedCount = TEST_CATALOG.filter((t) => record.results[t.key] === 'passed').length;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X color={colors.textPrimary} size={22} />
          </Pressable>
          <Text style={styles.headerTitle}>تقرير الفحص الشامل</Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Score hero */}
          <View style={styles.hero}>
            <Animated.View
              style={[styles.ring, { borderColor: scoreColor, transform: [{ scale: ring }] }]}
            >
              <Text style={[styles.ringScore, { color: scoreColor }]}>{record.score}</Text>
              <Text style={styles.ringMax}>/ 100</Text>
            </Animated.View>
            <Text style={styles.device}>{record.deviceName}</Text>
            <Text style={styles.date}>{formatDate(record.date)}</Text>
            <Text style={styles.summary}>
              نجح {passedCount} من {TEST_CATALOG.length} فحوصات
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>السعر التقديري ({record.priceLabel})</Text>
            <Text style={styles.priceValue}>
              {record.priceLow.toLocaleString('en-US')} - {record.priceHigh.toLocaleString('en-US')} ج.م
            </Text>
          </View>

          {/* Per-test breakdown */}
          <Text style={styles.sectionTitle}>تفاصيل الفحوصات</Text>
          {TEST_CATALOG.map((t) => {
            const status = record.results[t.key];
            const ok = status === 'passed';
            return (
              <View key={t.key} style={styles.row}>
                {ok ? (
                  <CheckCircle2 color={colors.success} size={22} strokeWidth={2.2} />
                ) : (
                  <XCircle color={colors.danger} size={22} strokeWidth={2.2} />
                )}
                <Text style={styles.rowLabel}>{t.short}</Text>
                <View style={styles.rowIcon}>
                  <t.icon color={colors.textSecondary} size={18} strokeWidth={2} />
                </View>
              </View>
            );
          })}

          {onRescan && (
            <Pressable style={styles.rescan} onPress={onRescan}>
              <Text style={styles.rescanText}>إجراء فحص جديد</Text>
              <RotateCcw color={colors.bg} size={18} strokeWidth={2.4} />
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '900', writingDirection: 'rtl' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  ring: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  ringScore: { fontSize: 42, fontWeight: '900' },
  ringMax: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  device: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.lg,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 4, writingDirection: 'rtl' },
  summary: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.sm, writingDirection: 'rtl' },
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.amberDeep,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  priceLabel: { color: colors.textSecondary, fontSize: 13, writingDirection: 'rtl' },
  priceValue: {
    color: colors.amber,
    fontSize: 22,
    fontWeight: '900',
    marginTop: spacing.xs,
    writingDirection: 'rtl',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: spacing.md,
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescan: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neon,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  rescanText: { color: colors.bg, fontSize: 16, fontWeight: '900', writingDirection: 'rtl' },
});
