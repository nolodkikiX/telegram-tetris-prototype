import Phaser from 'phaser';

import { GAME_BACKGROUND, GAME_HEIGHT, GAME_WIDTH } from './config';
import { setAppRuntimeInfo } from './runtime';
import { BootScene } from '../game/scenes/BootScene';
import { GameScene } from '../game/scenes/GameScene';
import { getCappedUiResolution } from '../game/ui/textClarity';
import { bootstrapTelegramMiniApp } from '../telegram/miniApp';

export async function createGame(parent: string): Promise<Phaser.Game> {
  const runtime = await bootstrapTelegramMiniApp();
  setAppRuntimeInfo({ isTelegram: runtime.isTelegram, label: runtime.label });

  const parentElement = document.getElementById(parent);
  if (parentElement) {
    parentElement.textContent = '';
  }

  const config = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: GAME_BACKGROUND,
    resolution: getCappedUiResolution(),
    autoRound: true,
    scene: [BootScene, GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  } as Phaser.Types.Core.GameConfig & { resolution: number };

  return new Phaser.Game(config);
}
