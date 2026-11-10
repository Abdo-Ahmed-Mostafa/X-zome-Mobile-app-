import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionRecord } from '../types';

const KEY = '@xzoom/inspection_history_v1';
const MAX_HISTORY = 30;

/** Loads saved inspection history, newest first. */
export async function loadHistory(): Promise<InspectionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InspectionRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.date - a.date);
  } catch {
    return [];
  }
}

/** Persists a new inspection record, keeping the most recent MAX_HISTORY. */
export async function saveRecord(record: InspectionRecord): Promise<InspectionRecord[]> {
  const history = await loadHistory();
  const next = [record, ...history].slice(0, MAX_HISTORY);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage write failed — non-fatal
  }
  return next;
}

/** Clears all saved inspection history. */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
