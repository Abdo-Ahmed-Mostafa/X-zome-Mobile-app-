/** Shared domain types for X ZOOM. */

export type TabKey = 'home' | 'specs' | 'diagnostics' | 'store';

/** Identifier for each diagnostic check in the inspection report. */
export type TestKey =
  | 'charging'
  | 'touch'
  | 'pixels'
  | 'motion'
  | 'gyroscope'
  | 'compass'
  | 'vibration'
  | 'speaker'
  | 'microphone'
  | 'network';

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed';

export type InspectionReport = Record<TestKey, TestStatus>;

/** A completed, saved inspection run. */
export interface InspectionRecord {
  id: string;
  date: number; // epoch ms
  deviceName: string;
  score: number; // 0-100
  priceLow: number;
  priceHigh: number;
  priceLabel: string;
  results: InspectionReport;
}

export interface StorePhone {
  id: string;
  name: string;
  brand: string;
  storage: string;
  condition: string;
  price: number; // EGP
  badges: string[];
  accent: 'neon' | 'amber' | 'success';
  /** Optional override used to look the phone up in the live specs API,
   *  for models whose display name doesn't match the GSMArena title. */
  specQuery?: string;
}
