import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from '../components/PressableScale';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import {
  Stethoscope,
  Play,
  ChevronLeft,
  History,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import ScreenContainer from '../components/ScreenContainer';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import CreditFooter from '../components/CreditFooter';
import { colors, gradients, radius, shadow, spacing } from '../theme/theme';
import { InspectionRecord, InspectionReport } from '../types';
import { TEST_CATALOG, TEST_COUNT } from '../data/testCatalog';
import { scoreReport, priceForScore, formatDate } from '../data/scoring';
import { buildDeviceProfile } from '../data/deviceProfile';
import { loadHistory, saveRecord, clearHistory } from '../data/reportStore';
import InspectionWizard from './wizard/InspectionWizard';
import ReportView from './ReportView';

export default function DiagnosticsScreen() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  const [viewing, setViewing] = useState<InspectionRecord | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('جهازك');

  useEffect(() => {
    loadHistory().then(setHistory);
    buildDeviceProfile().then((p) => setDeviceName(p.title));
  }, []);

  const latest = history[0] ?? null;

  const startInspection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setWizardOpen(true);
  };

  const handleComplete = async (results: InspectionReport) => {
    setWizardOpen(false);
    const score = scoreReport(results);
    const price = priceForScore(Device.modelName, score);
    const record: InspectionRecord = {
      id: `${Date.now()}`,
      date: Date.now(),
      deviceName,
      score,
      priceLow: price.low,
      priceHigh: price.high,
      priceLabel: price.label,
      results,
    };
    const next = await saveRecord(record);
    setHistory(next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setViewing(record);
    setReportOpen(true);
  };

  const openRecord = (rec: InspectionRecord) => {
    setViewing(rec);
    setReportOpen(true);
  };

  const wipeHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="فحص العتاد" subtitle="فحص تلقائي متسلسل خطوة بخطوة" />

      {/* Start inspection CTA */}
      <Card delay={0} gradient style={styles.startCard}>
        <LinearGradient
          colors={gradients.neon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.startIcon, shadow.neon]}
        >
          <Stethoscope color={colors.bg} size={30} strokeWidth={2.3} />
        </LinearGradient>
        <Text style={styles.startTitle}>ابدأ الفحص الشامل</Text>
        <Text style={styles.startDesc}>
          {TEST_COUNT} فحوصات متتالية للعتاد والمستشعرات — يظهر كل فحص على حدة وينتقل تلقائيًا عند
          النجاح، وفي النهاية يظهر تقرير مفصّل يُحفظ على جهازك.
        </Text>
        <PressableScale onPress={startInspection} haptic={false} style={styles.startBtnWrap}>
          <LinearGradient
            colors={gradients.neon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.startBtn, shadow.soft]}
          >
            <Text style={styles.startBtnText}>ابدأ الآن</Text>
            <Play color={colors.bg} size={18} strokeWidth={2.6} fill={colors.bg} />
          </LinearGradient>
        </PressableScale>
      </Card>

      {/* Latest result */}
      {latest && (
        <PressableScale onPress={() => openRecord(latest)} haptic>
          <Card delay={80} gradient style={styles.latestCard}>
            <View style={styles.latestInner}>
              <ChevronLeft color={colors.textMuted} size={22} />
              <View style={styles.flex}>
                <Text style={styles.latestLabel}>آخر فحص</Text>
                <Text style={styles.latestDevice}>{latest.deviceName}</Text>
                <Text style={styles.latestDate}>{formatDate(latest.date)}</Text>
              </View>
              <ScoreBadge score={latest.score} />
            </View>
          </Card>
        </PressableScale>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <View style={styles.historyHeader}>
            <Pressable onPress={wipeHistory} hitSlop={8} style={styles.clearBtn}>
              <Text style={styles.clearText}>مسح</Text>
              <Trash2 color={colors.danger} size={15} strokeWidth={2.2} />
            </Pressable>
            <View style={styles.historyTitleWrap}>
              <Text style={styles.historyTitle}>سجل الفحوصات</Text>
              <History color={colors.textSecondary} size={18} strokeWidth={2.2} />
            </View>
          </View>

          {history.map((rec, i) => (
            <PressableScale key={rec.id} onPress={() => openRecord(rec)} haptic>
              <Card delay={120 + i * 30} style={styles.histCard}>
                <View style={styles.histInner}>
                  <ChevronLeft color={colors.textMuted} size={20} />
                  <View style={styles.flex}>
                    <Text style={styles.histDevice}>{rec.deviceName}</Text>
                    <Text style={styles.histDate}>{formatDate(rec.date)}</Text>
                  </View>
                  <View style={styles.histScorePill}>
                    <Text style={[styles.histScore, { color: scoreColor(rec.score) }]}>
                      {rec.score}
                    </Text>
                  </View>
                </View>
              </Card>
            </PressableScale>
          ))}
        </>
      )}

      {!latest && (
        <Card delay={80} style={styles.emptyCard}>
          <CheckCircle2 color={colors.textMuted} size={28} strokeWidth={1.8} />
          <Text style={styles.emptyText}>لا توجد فحوصات محفوظة بعد — ابدأ أول فحص الآن</Text>
        </Card>
      )}

      <CreditFooter />

      <InspectionWizard
        visible={wizardOpen}
        onCancel={() => setWizardOpen(false)}
        onComplete={handleComplete}
      />
      <ReportView
        visible={reportOpen}
        record={viewing}
        onClose={() => setReportOpen(false)}
        onRescan={() => {
          setReportOpen(false);
          setTimeout(startInspection, 250);
        }}
      />
    </ScreenContainer>
  );
}

const scoreColor = (s: number) =>
  s >= 75 ? colors.success : s >= 50 ? colors.amber : colors.danger;

function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeScore, { color }]}>{score}</Text>
      <Text style={styles.badgeMax}>/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  startCard: { alignItems: 'center', paddingVertical: spacing.xl },
  startIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: spacing.md,
    writingDirection: 'rtl',
  },
  startDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    writingDirection: 'rtl',
  },
  startBtnWrap: { marginTop: spacing.lg },
  startBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  startBtnText: { color: colors.bg, fontSize: 16, fontWeight: '900', writingDirection: 'rtl' },
  latestCard: { marginTop: spacing.lg },
  latestInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  latestLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'right', writingDirection: 'rtl' },
  latestDevice: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  latestDate: { color: colors.textMuted, fontSize: 12, marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  badge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  badgeScore: { fontSize: 22, fontWeight: '900' },
  badgeMax: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  historyHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  historyTitleWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  historyTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', writingDirection: 'rtl' },
  clearBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  clearText: { color: colors.danger, fontSize: 13, fontWeight: '700', writingDirection: 'rtl' },
  histCard: { marginBottom: spacing.sm, paddingVertical: spacing.md },
  histInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  histDevice: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' },
  histDate: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  histScorePill: {
    minWidth: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  histScore: { fontSize: 18, fontWeight: '900' },
  emptyCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', writingDirection: 'rtl' },
});
