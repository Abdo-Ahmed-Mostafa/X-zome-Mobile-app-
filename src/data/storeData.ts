import { StorePhone } from '../types';

/** Showcase inventory for the X ZOOM store preview. Prices in EGP. */
export const STORE_PHONES: StorePhone[] = [
  {
    id: 'ip15pm',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    storage: '256GB',
    condition: 'كسر زيرو',
    price: 68500,
    badges: ['كسر زيرو', 'ضمان محلي'],
    accent: 'neon',
  },
  {
    id: 'ip15p',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    storage: '128GB',
    condition: 'كسر زيرو',
    price: 54900,
    badges: ['كسر زيرو', 'ضمان محلي'],
    accent: 'neon',
  },
  {
    id: 's24u',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    storage: '512GB',
    condition: 'جديد متبرشم',
    price: 61000,
    badges: ['جديد', 'ضمان محلي'],
    accent: 'amber',
  },
  {
    id: 's24',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    storage: '256GB',
    condition: 'استيراد',
    price: 38500,
    badges: ['استيراد', 'ضمان محلي'],
    accent: 'amber',
  },
  {
    id: 'honor200',
    name: 'Honor 200 Pro',
    brand: 'Honor',
    storage: '512GB',
    condition: 'جديد متبرشم',
    price: 29900,
    badges: ['جديد', 'عرض خاص'],
    accent: 'success',
  },
  {
    id: 'ip14',
    name: 'iPhone 14',
    brand: 'Apple',
    storage: '128GB',
    condition: 'مستعمل نظيف',
    price: 31500,
    badges: ['مستعمل', 'فحص معتمد'],
    accent: 'neon',
  },
  {
    id: 'a55',
    name: 'Samsung Galaxy A55',
    brand: 'Samsung',
    storage: '256GB',
    condition: 'جديد متبرشم',
    price: 17900,
    badges: ['جديد', 'الأكثر مبيعًا'],
    accent: 'amber',
  },
  {
    id: 'redmi13',
    name: 'Xiaomi Redmi Note 13 Pro',
    brand: 'Xiaomi',
    storage: '256GB',
    condition: 'جديد متبرشم',
    price: 13500,
    badges: ['جديد', 'أفضل سعر'],
    accent: 'success',
  },
];

/**
 * Rough market price band keyed by brand keyword, used by the
 * instant inspection estimator. Values in EGP.
 */
export function estimatePriceBand(modelName: string | null): {
  low: number;
  high: number;
  label: string;
} {
  const name = (modelName ?? '').toLowerCase();

  if (name.includes('iphone') && (name.includes('pro max') || name.includes('15') || name.includes('16'))) {
    return { low: 45000, high: 70000, label: 'آيفون حديث (Pro)' };
  }
  if (name.includes('iphone')) {
    return { low: 18000, high: 45000, label: 'آيفون' };
  }
  if (name.includes('galaxy') || name.includes('samsung') || name.includes('sm-')) {
    return { low: 12000, high: 60000, label: 'سامسونج جالاكسي' };
  }
  if (name.includes('honor')) {
    return { low: 10000, high: 30000, label: 'هونر' };
  }
  if (name.includes('xiaomi') || name.includes('redmi') || name.includes('poco')) {
    return { low: 8000, high: 25000, label: 'شاومي / ريدمي' };
  }
  // Fallback generic Android band
  return { low: 6000, high: 20000, label: 'جهاز أندرويد' };
}
