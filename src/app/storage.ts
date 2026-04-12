const BEST_SCORE_KEY = 'telegram-tetris-best-score';
const SESSIONS_PLAYED_KEY = 'telegram-tetris-sessions-played';
const TOTAL_LINES_CLEARED_KEY = 'telegram-tetris-total-lines-cleared';
const HAPTICS_ENABLED_KEY = 'telegram-tetris-haptics-enabled';
const LAST_SCORE_KEY = 'telegram-tetris-last-score';
const LAST_LEVEL_KEY = 'telegram-tetris-last-level';
const LAST_LINES_KEY = 'telegram-tetris-last-lines';

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function loadBestScore(): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  if (!canUseLocalStorage() || score <= 0) {
    return;
  }

  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Silent fallback.
  }
}

export function loadSessionsPlayed(): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(SESSIONS_PLAYED_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveSessionsPlayed(count: number): void {
  if (!canUseLocalStorage() || count <= 0) {
    return;
  }

  try {
    window.localStorage.setItem(SESSIONS_PLAYED_KEY, String(count));
  } catch {
    // Silent fallback.
  }
}

export function loadTotalLinesCleared(): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(TOTAL_LINES_CLEARED_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveTotalLinesCleared(count: number): void {
  if (!canUseLocalStorage() || count <= 0) {
    return;
  }

  try {
    window.localStorage.setItem(TOTAL_LINES_CLEARED_KEY, String(count));
  } catch {
    // Silent fallback.
  }
}

export function loadHapticsEnabled(): boolean {
  if (!canUseLocalStorage()) {
    return true;
  }

  try {
    const raw = window.localStorage.getItem(HAPTICS_ENABLED_KEY);
    return raw === null ? true : raw !== '0';
  } catch {
    return true;
  }
}

export function saveHapticsEnabled(enabled: boolean): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(HAPTICS_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    // Silent fallback.
  }
}

export function loadLastScore(): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(LAST_SCORE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveLastScore(score: number): void {
  if (!canUseLocalStorage() || score < 0) {
    return;
  }

  try {
    window.localStorage.setItem(LAST_SCORE_KEY, String(score));
  } catch {
    // Silent fallback.
  }
}

export function loadLastLevel(): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(LAST_LEVEL_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveLastLevel(level: number): void {
  if (!canUseLocalStorage() || level < 0) {
    return;
  }

  try {
    window.localStorage.setItem(LAST_LEVEL_KEY, String(level));
  } catch {
    // Silent fallback.
  }
}

export function loadLastLines(): number {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(LAST_LINES_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveLastLines(lines: number): void {
  if (!canUseLocalStorage() || lines < 0) {
    return;
  }

  try {
    window.localStorage.setItem(LAST_LINES_KEY, String(lines));
  } catch {
    // Silent fallback.
  }
}
