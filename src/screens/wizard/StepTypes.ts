/** Shared contract for every wizard step component. */
export interface StepProps {
  /** Mark the current test passed. The wizard advances to the next test. */
  onPass: () => void;
  /** Mark the current test failed. The wizard still advances to the next test. */
  onFail: () => void;
}

/**
 * Per-test UI configuration the wizard reads to decide whether to render its
 * own shared "mark as failed" button at the bottom.
 *
 * Steps that already show their own pass/fail choice (speaker, vibration) or
 * that finish instantly (network) opt out via `ownControls`.
 */
export interface StepConfig {
  /** The step renders its own pass/fail controls — hide the shared fail bar. */
  ownControls?: boolean;
  /** Custom label for the shared fail button. */
  failLabel?: string;
}
