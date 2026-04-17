import {
  expandViewport,
  init,
  isTMA,
  miniAppReady,
  mountMiniAppSync,
  mountViewport,
  retrieveLaunchParams,
} from '@telegram-apps/sdk';

import { configureStorageScope } from '../app/storage';

export interface TelegramShellState {
  isTelegram: boolean;
  initialized: boolean;
  viewportMounted: boolean;
  label: 'Telegram Mini App' | 'Browser preview';
}

function getTelegramUserId(): number | null {
  try {
    return retrieveLaunchParams(true).tgWebAppData?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function bootstrapTelegramMiniApp(): Promise<TelegramShellState> {
  if (!isTMA()) {
    configureStorageScope(null);
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
    configureStorageScope(getTelegramUserId());

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
    configureStorageScope(null);
    return {
      isTelegram: false,
      initialized: false,
      viewportMounted: false,
      label: 'Browser preview',
    };
  }
}
