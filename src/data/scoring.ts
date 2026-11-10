import { InspectionReport } from '../types';
import { TEST_CATALOG } from './testCatalog';
import { estimatePriceBand } from './storeData';

/** Score = percentage of tests that passed, equally weighted. */
export function scoreReport(report: InspectionReport): number {
  const total = TEST_CATALOG.length;
  const passed = TEST_CATALOG.filter((t) => report[t.key] === 'passed').length;
  return Math.round((passed / total) * 100);
}

/** Estimated resale band adjusted down for a lower score. */
export function priceForScore(modelName: string | null, score: number) {
  const band = estimatePriceBand(modelName);
  const factor = score / 100;
  const low = Math.round((band.low * (0.6 + 0.4 * factor)) / 100) * 100;
  const high = Math.round((band.high * (0.6 + 0.4 * factor)) / 100) * 100;
  return { low, high, label: band.label };
}

export function formatDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
