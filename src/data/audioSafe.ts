/**
 * Safe, LAZY wrapper around `expo-audio`.
 *
 * `expo-audio` ships native code that is NOT bundled inside Expo Go. Importing
 * it at module-load time can throw during app startup there (a blank "something
 * went wrong" screen with no JS logs). To stay safe we never import it eagerly:
 * the module is resolved only the first time a step actually asks for it, inside
 * a try/catch. In a development build or standalone APK it resolves normally.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: any = null;
let resolved = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveAudio(): any {
  if (resolved) return cached;
  resolved = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-audio');
    cached = mod && mod.AudioModule ? mod : null;
  } catch {
    cached = null;
  }
  return cached;
}

/** True when the native audio module is usable in the current runtime. */
export function isAudioAvailable(): boolean {
  return !!resolveAudio();
}

/** The resolved expo-audio module, or null when unavailable (e.g. Expo Go). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getExpoAudio(): any {
  return resolveAudio();
}
