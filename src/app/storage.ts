const BEST_SCORE_KEY = 'telegram-tetris-best-score';
const SESSIONS_PLAYED_KEY = 'telegram-tetris-sessions-played';
const TOTAL_LINES_CLEARED_KEY = 'telegram-tetris-total-lines-cleared';
const HAPTICS_ENABLED_KEY = 'telegram-tetris-haptics-enabled';
const LAST_SCORE_KEY = 'telegram-tetris-last-score';
const LAST_LEVEL_KEY = 'telegram-tetris-last-level';
const LAST_LINES_KEY = 'telegram-tetris-last-lines';
let activeStorageScopeSuffix = '';

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function normalizeStorageScopeSuffix(telegramUserId?: number | string | null): string {
  if (telegramUserId === null || telegramUserId === undefined) {
    return '';
  }

  const normalized = String(telegramUserId).trim();
  return normalized ? `user-${normalized}` : '';
}

function getStorageKey(baseKey: string): string {
  return activeStorageScopeSuffix ? `${baseKey}-${activeStorageScopeSuffix}` : baseKey;
}

function readStorageValue(baseKey: string): string | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const scopedKey = getStorageKey(baseKey);
    const scopedValue = window.localStorage.getItem(scopedKey);
    if (scopedValue !== null) {
      return scopedValue;
    }

    if (scopedKey !== baseKey) {
      return window.localStorage.getItem(baseKey);
    }

    return null;
  } catch {
    return null;
  }
}

function writeStorageValue(baseKey: string, value: string): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(baseKey), value);
  } catch {
    // Silent fallback.
  }
}

export function configureStorageScope(telegramUserId?: number | string | null): void {
  activeStorageScopeSuffix = normalizeStorageScopeSuffix(telegramUserId);
}

export function loadBestScore(): number {
  const raw = readStorageValue(BEST_SCORE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveBestScore(score: number): void {
  if (!canUseLocalStorage() || score <= 0) {
    return;
  }

  writeStorageValue(BEST_SCORE_KEY, String(score));
}

export function loadSessionsPlayed(): number {
  const raw = readStorageValue(SESSIONS_PLAYED_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveSessionsPlayed(count: number): void {
  if (!canUseLocalStorage() || count <= 0) {
    return;
  }

  writeStorageValue(SESSIONS_PLAYED_KEY, String(count));
}

export function loadTotalLinesCleared(): number {
  const raw = readStorageValue(TOTAL_LINES_CLEARED_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveTotalLinesCleared(count: number): void {
  if (!canUseLocalStorage() || count <= 0) {
    return;
  }

  writeStorageValue(TOTAL_LINES_CLEARED_KEY, String(count));
}

export function loadHapticsEnabled(): boolean {
  const raw = readStorageValue(HAPTICS_ENABLED_KEY);
  return raw === null ? true : raw !== '0';
}

export function saveHapticsEnabled(enabled: boolean): void {
  if (!canUseLocalStorage()) {
    return;
  }

  writeStorageValue(HAPTICS_ENABLED_KEY, enabled ? '1' : '0');
}

export function loadLastScore(): number {
  const raw = readStorageValue(LAST_SCORE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function saveLastScore(score: number): void {
  if (!canUseLocalStorage() || score < 0) {
    return;
  }

  writeStorageValue(LAST_SCORE_KEY, String(score));
}

export function loadLastLevel(): number {
  const raw = readStorageValue(LAST_LEVEL_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function saveLastLevel(level: number): void {
  if (!canUseLocalStorage() || level < 0) {
    return;
  }

  writeStorageValue(LAST_LEVEL_KEY, String(level));
}

export function loadLastLines(): number {
  const raw = readStorageValue(LAST_LINES_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function saveLastLines(lines: number): void {
  if (!canUseLocalStorage() || lines < 0) {
    return;
  }

  writeStorageValue(LAST_LINES_KEY, String(lines));
}
