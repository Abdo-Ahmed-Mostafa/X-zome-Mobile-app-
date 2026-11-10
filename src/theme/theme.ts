/**
 * X ZOOM — Brand theme tokens.
 * Luxury dark-mode palette extracted from the store's neon signage.
 */

export const colors = {
  // Backgrounds
  bg: '#0b0f19', // Rich obsidian dark
  surface: '#131b2e', // Card surface & modals
  surfaceAlt: '#1e2942', // Gradient end / raised surface
  border: '#1e293b', // Subtle card border

  // Brand neon (sign backlight)
  neon: '#00E5FF', // Primary electric cyan
  neonDeep: '#0284c7', // Deep blue variant

  // Accent (wooden slat warm lighting)
  amber: '#F59E0B',
  amberDeep: '#D97706',

  // States
  success: '#10B981', // Emerald green
  danger: '#EF4444', // Coral red
  warning: '#F59E0B',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Pure test colors (dead-pixel suite)
  pureRed: '#FF0000',
  pureGreen: '#00FF00',
  pureBlue: '#0000FF',
  pureWhite: '#FFFFFF',
  pureBlack: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const font = {
  // System fonts render Arabic cleanly on both platforms.
  black: '900' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

/** Gradient color tuples for LinearGradient (readonly, min 2 colors). */
export const gradients = {
  surface: ['#1a2540', '#131b2e'] as const,
  neon: ['#00E5FF', '#0284c7'] as const,
  amber: ['#F59E0B', '#D97706'] as const,
  success: ['#10B981', '#059669'] as const,
  hero: ['#152138', '#0d1322'] as const,
  dark: ['#131b2e', '#0b0f19'] as const,
} as const;

export const shadow = {
  neon: {
    shadowColor: colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  amber: {
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const STORE_PHONE = '201026430102';
export const DEV_CREDIT = 'تطوير وبرمجة: م. عبدالرحمن أحمد | 01026430102';
