import * as Device from 'expo-device';
import { Paths } from 'expo-file-system';
import { Dimensions, PixelRatio, Platform } from 'react-native';

export interface DeviceProfile {
  title: string; // best human-friendly name
  brand: string;
  manufacturer: string;
  model: string;
  os: string;
  ram: string; // commercial-rounded RAM
  arch: string; // CPU architecture (not the commercial chip name)
  storage: string; // total internal storage, commercial-rounded
  storageFree: string; // available internal storage (real, not rounded)
  resolution: string; // real pixel resolution, e.g. "1080 × 2400"
  screenSize: string; // approximate diagonal in inches
  density: string; // pixel density
  typeLabel: string;
  isPhysical: boolean;
}

/** Real pixel resolution of the screen (physical pixels, not logical points). */
function readScreen(): { resolution: string; screenSize: string; density: string } {
  try {
    const { width, height, scale } = Dimensions.get('screen');
    const pxW = Math.round(width * scale);
    const pxH = Math.round(height * scale);
    const resolution = `${Math.min(pxW, pxH)} × ${Math.max(pxW, pxH)}`;

    // Density: Android exposes densityDpi; otherwise approximate from scale (~160 dpi baseline).
    const dpi = PixelRatio.get() * 160;

    // Approximate diagonal in inches = pixel diagonal / dpi.
    const diagPx = Math.sqrt(pxW * pxW + pxH * pxH);
    const inches = diagPx / dpi;
    const screenSize = inches > 0 ? `${inches.toFixed(1)}" (تقريبي)` : 'غير متاح';

    return {
      resolution,
      screenSize,
      density: `${Math.round(dpi)} نقطة/بوصة`,
    };
  } catch {
    return { resolution: 'غير متاح', screenSize: 'غير متاح', density: 'غير متاح' };
  }
}

const deviceTypeLabel = (t: Device.DeviceType | null): string => {
  switch (t) {
    case Device.DeviceType.PHONE:
      return 'هاتف ذكي';
    case Device.DeviceType.TABLET:
      return 'جهاز لوحي';
    case Device.DeviceType.DESKTOP:
      return 'حاسب مكتبي';
    case Device.DeviceType.TV:
      return 'تلفاز';
    default:
      return 'غير معروف';
  }
};

// Standard commercial capacity tiers (GB) for RAM and storage.
const TIERS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 64, 128, 256, 512, 1024];

/**
 * Reported memory/storage is always a bit below the number on the box (the OS
 * and firmware reserve some). Snap the raw GB value UP to the nearest standard
 * commercial tier so a device that reports ~7.4 GB shows as "8".
 */
function snapToTier(rawGB: number): number {
  for (const tier of TIERS) {
    // Allow up to ~18% overhead below a tier before snapping to it.
    if (rawGB <= tier && rawGB >= tier * 0.82) return tier;
    if (rawGB < tier * 0.82) {
      // closer to the previous tier; return the nearest sensible one
      return tier;
    }
  }
  return Math.round(rawGB);
}

function formatCapacity(bytes: number | null | undefined, approx: boolean): string {
  if (!bytes || bytes <= 0) return 'غير متاح';
  const rawGB = bytes / 1024 ** 3;
  if (rawGB >= 1) {
    const tier = snapToTier(rawGB);
    return approx ? `${tier} جيجابايت` : `${tier} جيجابايت`;
  }
  return `${(rawGB * 1024).toFixed(0)} ميجابايت`;
}

function readTotalStorage(): string {
  try {
    return formatCapacity(Paths.totalDiskSpace, false);
  } catch {
    return 'غير متاح';
  }
}

/** Real available storage (not snapped — this is a live telemetry value). */
function readFreeStorage(): string {
  try {
    const bytes = Paths.availableDiskSpace;
    if (!bytes || bytes <= 0) return 'غير متاح';
    const gb = bytes / 1024 ** 3;
    return gb >= 1 ? `${gb.toFixed(1)} جيجابايت` : `${(gb * 1024).toFixed(0)} ميجابايت`;
  } catch {
    return 'غير متاح';
  }
}

/**
 * Builds a friendly device profile from the hardware, showing only values that
 * are genuinely useful and reasonably accurate. Values the platform can't give
 * reliably (e.g. the commercial chip name or the manufacture year) are omitted
 * on purpose rather than shown misleadingly.
 */
export async function buildDeviceProfile(): Promise<DeviceProfile> {
  let type = Device.deviceType;
  try {
    type = await Device.getDeviceTypeAsync();
  } catch {
    // keep static fallback
  }

  const brand = Device.brand ?? Device.manufacturer ?? '';
  const manufacturer = Device.manufacturer ?? brand ?? '—';
  const model = Device.modelName ?? Device.modelId ?? 'غير معروف';

  const brandWord = (brand || manufacturer).trim();
  const modelHasBrand = brandWord && model.toLowerCase().includes(brandWord.toLowerCase());
  const title = modelHasBrand ? model : `${brandWord} ${model}`.trim() || 'جهاز غير معروف';

  const os = `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ''}`.trim();
  const arch = (Device.supportedCpuArchitectures ?? []).join(' • ') || 'غير متاح';
  const screen = readScreen();

  return {
    title,
    brand: brandWord || '—',
    manufacturer,
    model,
    os,
    ram: formatCapacity(Device.totalMemory, true),
    arch,
    storage: readTotalStorage(),
    storageFree: readFreeStorage(),
    resolution: screen.resolution,
    screenSize: screen.screenSize,
    density: screen.density,
    typeLabel: deviceTypeLabel(type),
    isPhysical: Device.isDevice,
  };
}
