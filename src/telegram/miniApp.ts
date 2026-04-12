import {
  expandViewport,
  init,
  isTMA,
  miniAppReady,
  mountMiniAppSync,
  mountViewport,
} from '@telegram-apps/sdk';

export interface TelegramShellState {
  isTelegram: boolean;
  initialized: boolean;
  viewportMounted: boolean;
  label: 'Telegram Mini App' | 'Browser preview';
}

export async function bootstrapTelegramMiniApp(): Promise<TelegramShellState> {
  if (!isTMA()) {
    return {
      isTelegram: false,
      initialized: false,
      viewportMounted: false,
      label: 'Browser preview',
    };
  }

  try {
    const cleanup = init();
    void cleanup;

    let viewportMounted = false;

    if (mountMiniAppSync.isAvailable()) {
      mountMiniAppSync();
    }

    if (mountViewport.isAvailable()) {
      await mountViewport();
      viewportMounted = true;
    }

    if (expandViewport.isAvailable()) {
      expandViewport();
    }

    if (miniAppReady.isAvailable()) {
      miniAppReady();
    }

    return {
      isTelegram: true,
      initialized: true,
      viewportMounted,
      label: 'Telegram Mini App',
    };
  } catch {
    return {
      isTelegram: false,
      initialized: false,
      viewportMounted: false,
      label: 'Browser preview',
    };
  }
}
