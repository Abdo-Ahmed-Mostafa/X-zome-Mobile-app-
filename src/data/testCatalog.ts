import {
  BatteryCharging,
  Grid3x3,
  Palette,
  Activity,
  RotateCw,
  Compass,
  Vibrate,
  Volume2,
  Mic,
  Wifi,
  LucideIcon,
} from 'lucide-react-native';
import { TestKey } from '../types';

export interface TestDef {
  key: TestKey;
  title: string;
  short: string; // short label for the report rows
  desc: string;
  icon: LucideIcon;
}

/**
 * The full ordered inspection sequence. The wizard walks these top-to-bottom,
 * auto-advancing to the next once the current one passes.
 */
export const TEST_CATALOG: TestDef[] = [
  {
    key: 'charging',
    title: 'فحص سوكت الشحن والبطارية',
    short: 'سوكت الشحن',
    desc: 'ركّب الشاحن للتأكد من عمل منفذ الطاقة',
    icon: BatteryCharging,
  },
  {
    key: 'touch',
    title: 'فحص التاتش الشامل',
    short: 'شاشة اللمس',
    desc: 'مرّر إصبعك على كامل الشاشة',
    icon: Grid3x3,
  },
  {
    key: 'pixels',
    title: 'فحص بيكسلات الشاشة',
    short: 'بيكسلات الشاشة',
    desc: 'تصفّح الألوان لكشف النقاط الميتة',
    icon: Palette,
  },
  {
    key: 'motion',
    title: 'فحص مستشعر الحركة',
    short: 'مستشعر الحركة',
    desc: 'هز الهاتف لاختبار الـ Accelerometer',
    icon: Activity,
  },
  {
    key: 'gyroscope',
    title: 'فحص الجايروسكوب',
    short: 'الجايروسكوب',
    desc: 'دوّر الهاتف لاختبار مستشعر الدوران',
    icon: RotateCw,
  },
  {
    key: 'compass',
    title: 'فحص البوصلة المغناطيسية',
    short: 'البوصلة',
    desc: 'لف الهاتف في كل الاتجاهات',
    icon: Compass,
  },
  {
    key: 'vibration',
    title: 'فحص الاهتزاز والهابتيك',
    short: 'الاهتزاز',
    desc: 'التأكد من عمل موتور الاهتزاز',
    icon: Vibrate,
  },
  {
    key: 'speaker',
    title: 'فحص السماعة الخارجية',
    short: 'السماعة',
    desc: 'تشغيل نغمة للتأكد من مكبّر الصوت',
    icon: Volume2,
  },
  {
    key: 'microphone',
    title: 'فحص الميكروفون',
    short: 'الميكروفون',
    desc: 'تحدّث لرصد مستوى الصوت الداخل',
    icon: Mic,
  },
  {
    key: 'network',
    title: 'فحص الشبكة والاتصال',
    short: 'الشبكة',
    desc: 'التأكد من اتصال الواي فاي / البيانات',
    icon: Wifi,
  },
];

export const TEST_COUNT = TEST_CATALOG.length;

export const getTestDef = (key: TestKey): TestDef =>
  TEST_CATALOG.find((t) => t.key === key)!;

/**
 * Whether the shared "mark as failed" bar should show for each test, and its
 * label. Steps with their own pass/fail buttons opt out (ownControls).
 */
export const TEST_CONFIG: Record<
  TestKey,
  { ownControls?: boolean; failLabel?: string; fullBleed?: boolean; trueFullscreen?: boolean }
> = {
  charging: { failLabel: 'السوكيت لا يعمل ✗' },
  touch: { failLabel: 'توجد منطقة لا تستجيب ✗', fullBleed: true, trueFullscreen: true },
  pixels: { failLabel: 'توجد نقاط ميتة ✗', fullBleed: true, trueFullscreen: true },
  motion: { failLabel: 'المستشعر لا يستجيب ✗' },
  gyroscope: { failLabel: 'الجايروسكوب لا يستجيب ✗' },
  compass: { failLabel: 'البوصلة لا تعمل ✗' },
  vibration: { ownControls: true },
  speaker: { ownControls: true },
  microphone: { failLabel: 'الميكروفون لا يلتقط الصوت ✗' },
  network: { ownControls: true },
};
