import { loadHapticsEnabled } from './storage';

export function triggerHapticFeedback(duration = 12): void {
  try {
    if (!loadHapticsEnabled()) {
      return;
    }

    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return;
    }

    navigator.vibrate(duration);
  } catch {
    // Silent fallback.
  }
}
