import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../../app/config';
import { LIQUID_GLASS_TOKENS } from './visualTokens';

const BOARD_ORIGIN_Y = 108;

export interface StartOverlayElements {
  container: Phaser.GameObjects.Container;
  bestText: Phaser.GameObjects.Text;
  hapticsToggleText: Phaser.GameObjects.Text;
}

export interface PausedOverlayElements {
  container: Phaser.GameObjects.Container;
}

export interface GameOverOverlayElements {
  container: Phaser.GameObjects.Container;
  scoreText: Phaser.GameObjects.Text;
  bestText: Phaser.GameObjects.Text;
  newBestText: Phaser.GameObjects.Text;
}

function createOverlayShell(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: number,
): Phaser.GameObjects.Container {
  const glow = scene.add.rectangle(
    0,
    8,
    width + 14,
    height + 16,
    LIQUID_GLASS_TOKENS.ambientGlowPrimary,
    0.08,
  );
  const background = scene.add.rectangle(0, 0, width, height, LIQUID_GLASS_TOKENS.overlayGlassFill, 0.92);
  background.setStrokeStyle(1, strokeColor, 0.8);
  const strip = scene.add.rectangle(
    0,
    -height * 0.28,
    width - 12,
    18,
    LIQUID_GLASS_TOKENS.overlayGlassFillAlt,
    0.56,
  );
  const highlight = scene.add.rectangle(
    0,
    -height * 0.42,
    width - 28,
    6,
    LIQUID_GLASS_TOKENS.overlayGlassHighlight,
    0.14,
  );

  const container = scene.add.container(x, y, [glow, background, strip, highlight]);
  container.setDepth(14);
  return container;
}

function createActionChip(
  scene: Phaser.Scene,
  y: number,
  label: string,
  backgroundColor: string,
  onPress: () => void,
): Phaser.GameObjects.Text {
  const cta = scene.add.text(0, y, label, {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '15px',
    fontStyle: 'bold',
    backgroundColor,
    padding: { left: 26, right: 26, top: 10, bottom: 10 },
  }).setOrigin(0.5);
  cta.setInteractive({ useHandCursor: true });
  cta.on('pointerdown', onPress);
  return cta;
}

export function createStartOverlay(
  scene: Phaser.Scene,
  data: {
    bestScore: number;
  },
  actions: {
    onToggleHaptics: () => void;
    onStart: () => void;
  },
): StartOverlayElements {
  const container = createOverlayShell(scene, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, 246, 194, LIQUID_GLASS_TOKENS.overlayGlassStroke);

  const title = scene.add.text(0, -48, 'Telegram Tetris', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '21px',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const bestLabel = scene.add.text(0, -12, 'BEST SCORE', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.4,
  }).setOrigin(0.5);

  const bestText = scene.add.text(0, 16, `${data.bestScore}`, {
    color: '#f8fbff',
    fontFamily: 'Arial',
    fontSize: '28px',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const objectiveHint = scene.add.text(0, 44, 'Clear lines. Keep the stack clean.', {
    color: LIQUID_GLASS_TOKENS.overlayTextMuted,
    fontFamily: 'Arial',
    fontSize: '13px',
    align: 'center',
    wordWrap: { width: 194 },
  }).setOrigin(0.5);

  const hapticsToggleText = scene.add.text(0, 78, '', {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '12px',
    backgroundColor: '#10203a',
    padding: { left: 12, right: 12, top: 6, bottom: 6 },
  }).setOrigin(0.5);
  hapticsToggleText.setInteractive({ useHandCursor: true });
  hapticsToggleText.on('pointerdown', actions.onToggleHaptics);

  const cta = createActionChip(scene, 116, 'Play', '#1d4ed8', actions.onStart);

  container.add([
    title,
    bestLabel,
    bestText,
    objectiveHint,
    hapticsToggleText,
    cta,
  ]);

  return {
    container,
    bestText,
    hapticsToggleText,
  };
}

export function createPausedOverlay(
  scene: Phaser.Scene,
  actions: { onResume: () => void },
): PausedOverlayElements {
  const container = createOverlayShell(scene, GAME_WIDTH / 2, BOARD_ORIGIN_Y + 108, 178, 118, LIQUID_GLASS_TOKENS.overlayWarnStroke);

  const label = scene.add.text(0, -24, 'Paused', {
    color: '#fef3c7',
    fontFamily: 'Arial',
    fontSize: '20px',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const hint = scene.add.text(0, 2, 'Jump back in when ready.', {
    color: '#fde68a',
    fontFamily: 'Arial',
    fontSize: '12px',
  }).setOrigin(0.5);

  const cta = createActionChip(scene, 34, 'Resume', '#8b5cf6', actions.onResume);

  container.add([label, hint, cta]);
  return { container };
}

export function createGameOverOverlay(
  scene: Phaser.Scene,
  actions: { onRestart: () => void },
): GameOverOverlayElements {
  const container = createOverlayShell(scene, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8, 232, 186, LIQUID_GLASS_TOKENS.overlayDangerStroke);

  const title = scene.add.text(0, -46, 'Game Over', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '24px',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const scoreText = scene.add.text(0, -2, '0', {
    color: '#f8fbff',
    fontFamily: 'Arial',
    fontSize: '32px',
    fontStyle: 'bold',
    align: 'center',
  }).setOrigin(0.5);

  const bestText = scene.add.text(0, 38, '', {
    color: LIQUID_GLASS_TOKENS.overlayTextMuted,
    fontFamily: 'Arial',
    fontSize: '12px',
    align: 'center',
  }).setOrigin(0.5);

  const newBestText = scene.add.text(0, 62, 'New best', {
    color: '#facc15',
    fontFamily: 'Arial',
    fontSize: '14px',
    fontStyle: 'bold',
    align: 'center',
  }).setOrigin(0.5);
  newBestText.setVisible(false);

  const restartCta = createActionChip(scene, 94, 'Play Again', '#dc2626', actions.onRestart);

  container.add([
    title,
    scoreText,
    bestText,
    newBestText,
    restartCta,
  ]);

  return {
    container,
    scoreText,
    bestText,
    newBestText,
  };
}
