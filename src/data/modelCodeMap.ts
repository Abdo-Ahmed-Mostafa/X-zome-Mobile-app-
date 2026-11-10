/**
 * Maps a device's raw model code (what Android reports, e.g. "SM-A366B") to a
 * set of search queries likely to match the live specs API, which prefers the
 * short commercial name (e.g. "Galaxy A36").
 *
 * The API is picky: "SM-A366B" and "Samsung Galaxy A36" both miss, but
 * "Galaxy A36" hits. So we derive the best candidate queries from the code.
 */

/** Known Samsung SM-code prefixes → commercial Galaxy name. */
const SAMSUNG_PREFIX: Record<string, string> = {
  // A series
  'SM-A366': 'Galaxy A36',
  'SM-A556': 'Galaxy A55',
  'SM-A546': 'Galaxy A54',
  'SM-A356': 'Galaxy A35',
  'SM-A536': 'Galaxy A53',
  'SM-A525': 'Galaxy A52',
  'SM-A736': 'Galaxy A73',
  'SM-A057': 'Galaxy A05s',
  'SM-A155': 'Galaxy A15',
  'SM-A165': 'Galaxy A16',
  'SM-A256': 'Galaxy A25',
  // S series
  'SM-S928': 'Galaxy S24 Ultra',
  'SM-S926': 'Galaxy S24+',
  'SM-S921': 'Galaxy S24',
  'SM-S938': 'Galaxy S25 Ultra',
  'SM-S936': 'Galaxy S25+',
  'SM-S931': 'Galaxy S25',
  'SM-S918': 'Galaxy S23 Ultra',
  'SM-S911': 'Galaxy S23',
  // Z series
  'SM-F956': 'Galaxy Z Fold6',
  'SM-F741': 'Galaxy Z Flip6',
  // Note series
  'SM-N986': 'Galaxy Note20 Ultra',
};

/**
 * Returns an ordered list of search queries to try for a device, best-first.
 * @param modelCode  raw code like "SM-A366B" (may be null)
 * @param modelName  commercial/model name reported by the OS (may be null)
 * @param brand      brand/manufacturer (may be null)
 */
export function buildSpecQueries(
  modelCode: string | null | undefined,
  modelName: string | null | undefined,
  brand: string | null | undefined
): string[] {
  const queries: string[] = [];
  const add = (q?: string | null) => {
    if (q && q.trim() && !queries.includes(q.trim())) queries.push(q.trim());
  };

  const code = (modelCode ?? '').toUpperCase().trim();

  // 1) Samsung code → commercial name (most reliable for Samsung).
  if (code.startsWith('SM-')) {
    // Match by the longest known prefix (codes carry a region suffix letter).
    const hit = Object.keys(SAMSUNG_PREFIX).find((p) => code.startsWith(p));
    if (hit) add(SAMSUNG_PREFIX[hit]);
  }

  // 2) If the model name already looks commercial (not a bare code), use it,
  //    and a "Galaxy ..." variant for Samsung where the API prefers it.
  const name = (modelName ?? '').trim();
  const looksLikeCode = /^SM-|^[A-Z]{1,3}[0-9]/i.test(name) && name.length <= 10;
  if (name && !looksLikeCode) {
    add(name);
    const b = (brand ?? '').toLowerCase();
    if (b.includes('samsung')) {
      // "Samsung Galaxy A36" misses but "Galaxy A36" hits — strip the brand.
      add(name.replace(/samsung/gi, '').trim());
      if (!/galaxy/i.test(name)) add(`Galaxy ${name}`);
    } else {
      add(`${brand ?? ''} ${name}`.trim());
    }
  }

  return queries;
}
