import { useEffect, useRef, useState } from 'react';

interface Sensor {
  isAvailableAsync: () => Promise<boolean>;
}

/**
 * Shared guard for sensor-based steps:
 * - Checks the sensor is actually present; if not, auto-fails the step.
 * - After `hintAfterMs` with no success, exposes `showHint` so the UI can
 *   nudge the user (they can still use the wizard's fail button any time).
 */
export function useSensorGuard(
  sensor: Sensor,
  onFail: () => void,
  passedRef: React.MutableRefObject<boolean>,
  hintAfterMs = 6000
) {
  const [unavailable, setUnavailable] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const failedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    sensor
      .isAvailableAsync()
      .then((ok) => {
        if (!mounted) return;
        if (!ok) {
          setUnavailable(true);
          if (!passedRef.current && !failedRef.current) {
            failedRef.current = true;
            setTimeout(onFail, 1200);
          }
        }
      })
      .catch(() => {
        // treat an error as "can't verify" — let the user decide
      });

    const hintTimer = setTimeout(() => {
      if (mounted && !passedRef.current) setShowHint(true);
    }, hintAfterMs);

    return () => {
      mounted = false;
      clearTimeout(hintTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { unavailable, showHint };
}
