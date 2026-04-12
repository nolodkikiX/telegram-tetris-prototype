import { isTMA } from '@telegram-apps/sdk';

import { createGame } from './app/bootstrap';

function setAppMessage(message: string): void {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.textContent = message;
}

function getStartupLoadingMessage(): string {
  try {
    return isTMA() ? 'Starting Telegram Mini App...' : 'Starting local preview...';
  } catch {
    return 'Starting...';
  }
}

function getStartupErrorMessage(): string {
  try {
    if (isTMA()) {
      return 'Failed to start Telegram Mini App. Reload to try again.';
    }

    return 'Failed to start local preview. Reload to try again.';
  } catch {
    return 'Failed to start app. Reload to try again.';
  }
}

function showStartupErrorMessage(): void {
  setAppMessage(getStartupErrorMessage());
}

async function main(): Promise<void> {
  setAppMessage(getStartupLoadingMessage());

  try {
    await createGame('app');
  } catch (error) {
    console.error(error);
    showStartupErrorMessage();
  }
}

void main();
