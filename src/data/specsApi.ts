import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Live phone specifications from a free, public GSMArena-backed API
 * (no API key, no self-hosting). Results are cached on-device so a given model
 * is fetched only once.
 *
 * Source: https://mobile-specs-api-sandy.vercel.app
 */
const BASE = 'https://mobile-specs-api-sandy.vercel.app';
const CACHE_PREFIX = '@xzoom/spec_cache_v3:';
const REQUEST_TIMEOUT = 15000;

/** The last error seen during a lookup — surfaced to the UI for diagnostics. */
export let lastSpecError: string | null = null;

export interface LiveSpec {
  model: string;
  imageUrl?: string;
  releaseDate?: string;
  chipset?: string;
  cpu?: string;
  gpu?: string;
  displayType?: string;
  displaySize?: string;
  displayResolution?: string;
  displayProtection?: string;
  mainCamera?: string;
  selfieCamera?: string;
  videoCapabilities?: string;
  battery?: string;
  charging?: string;
  internal?: string;
  nfc?: boolean;
  usb?: string;
  jack35?: boolean;
  cardSlot?: boolean;
  has5g?: boolean;
  ipRating?: string;
}

// ---- helpers ----

function clean(v: string | undefined | null): string | undefined {
  if (!v) return undefined;
  const text = v
    .replace(/<sup>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length ? text : undefined;
}

function firstLine(v: string | undefined): string | undefined {
  if (!v) return undefined;
  return v.split('\n')[0].trim() || undefined;
}

/**
 * fetch + timeout via Promise.race (no AbortController).
 * Some React Native runtimes mishandle AbortController with fetch, aborting
 * the request immediately — which made every lookup fail. This avoids it.
 */
async function getJson(url: string): Promise<any> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT)
  );
  const res = (await Promise.race([
    fetch(url, { headers: { Accept: 'application/json' } }),
    timeout,
  ])) as Response;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---- public API ----

export async function fetchLiveSpec(query: string): Promise<LiveSpec | null> {
  lastSpecError = null;
  const trimmed = query.trim();
  if (!trimmed) return null;
  const key = CACHE_PREFIX + trimmed.toLowerCase();

  // 1) Cache
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.miss) return null;
      return parsed as LiveSpec;
    }
  } catch {
    // ignore cache errors
  }

  try {
    // 2) Search for the slug
    const searchJson = await getJson(`${BASE}/search?query=${encodeURIComponent(trimmed)}`);
    const first = searchJson?.data?.[0];
    if (!first?.slug) {
      lastSpecError = `لم يُعثر على "${trimmed}" في قاعدة البيانات`;
      await AsyncStorage.setItem(key, JSON.stringify({ miss: true })).catch(() => {});
      return null;
    }

    // 3) Fetch full specs by slug
    const detailJson = await getJson(`${BASE}/${first.slug}`);
    const spec = mapResponse(detailJson?.data);
    if (spec) {
      await AsyncStorage.setItem(key, JSON.stringify(spec)).catch(() => {});
      return spec;
    }
    lastSpecError = 'تعذّر قراءة بيانات المواصفات';
    return null;
  } catch (e: any) {
    // Network/timeout — do NOT cache (might work later).
    lastSpecError = `تعذّر الاتصال: ${e?.message ?? 'خطأ غير معروف'}`;
    return null;
  }
}

function mapResponse(data: any): LiveSpec | null {
  if (!data) return null;
  const s = data.specifications ?? {};
  const platform = s.Platform ?? {};
  const display = s.Display ?? {};
  const main = s['Main Camera'] ?? {};
  const selfie = s['Selfie camera'] ?? {};
  const battery = s.Battery ?? {};
  const memory = s.Memory ?? {};
  const comms = s.Comms ?? {};
  const sound = s.Sound ?? {};
  const body = s.Body ?? {};
  const network = s.Network ?? {};

  const mainCamRaw = clean(main.Triple ?? main.Quad ?? main.Dual ?? main.Single ?? main.Five);
  const bodyFeatures = clean(body.Features) ?? '';
  const ipMatch = bodyFeatures.match(/IP[X0-9]{2,3}/i);

  return {
    model: data.model ?? 'جهاز',
    imageUrl: data.imageUrl,
    releaseDate: clean(data.release_date),
    chipset: clean(platform.Chipset),
    cpu: clean(platform.CPU),
    gpu: clean(platform.GPU),
    displayType: clean(display.Type),
    displaySize: clean(display.Size),
    displayResolution: clean(display.Resolution),
    displayProtection: clean(display.Protection),
    mainCamera: mainCamRaw,
    selfieCamera: firstLine(clean(selfie.Single ?? selfie.Dual)),
    videoCapabilities: firstLine(clean(main.Video)),
    battery: clean(battery.Type),
    charging: firstLine(clean(battery.Charging)),
    internal: clean(memory.Internal),
    nfc: /yes/i.test(clean(comms.NFC) ?? ''),
    usb: clean(comms.USB),
    jack35: /yes/i.test(clean(sound['3.5mm jack']) ?? ''),
    cardSlot: !/no/i.test(clean(memory['Card slot']) ?? 'no'),
    has5g: /5g/i.test(clean(network.Technology) ?? ''),
    ipRating: ipMatch ? ipMatch[0].toUpperCase() : undefined,
  };
}
