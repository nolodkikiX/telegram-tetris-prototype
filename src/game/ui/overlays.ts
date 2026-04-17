import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../../app/config';

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
  const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24);
  const glow = scene.add.rectangle(0, 8, 272, 212, 0x38bdf8, 0.1);
  const background = scene.add.rectangle(0, 0, 256, 196, 0x07111f, 0.92);
  background.setStrokeStyle(1, 0x7dd3fc, 0.72);
  const highlight = scene.add.rectangle(0, -58, 220, 18, 0xe0f2fe, 0.08);

  const title = scene.add.text(0, -54, 'Telegram Tetris', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '22px',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const bestLabel = scene.add.text(0, -18, 'BEST SCORE', {
    color: '#9fb6d9',
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.4,
  }).setOrigin(0.5);

  const bestText = scene.add.text(0, 8, `${data.bestScore}`, {
    color: '#f8fbff',
    fontFamily: 'Arial',
    fontSize: '30px',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const objectiveHint = scene.add.text(0, 42, 'Clear lines. Hold the stack low.', {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '13px',
    align: 'center',
    wordWrap: { width: 204 },
  }).setOrigin(0.5);

  const hapticsToggleText = scene.add.text(0, 82, '', {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '13px',
    backgroundColor: '#0e1a2f',
    padding: { left: 12, right: 12, top: 6, bottom: 6 },
  }).setOrigin(0.5);
  hapticsToggleText.setInteractive({ useHandCursor: true });
  hapticsToggleText.on('pointerdown', actions.onToggleHaptics);

  const cta = scene.add.text(0, 122, 'Play', {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '15px',
    fontStyle: 'bold',
    backgroundColor: '#1d4ed8',
    padding: { left: 28, right: 28, top: 10, bottom: 10 },
  }).setOrigin(0.5);
  cta.setInteractive({ useHandCursor: true });
  cta.on('pointerdown', actions.onStart);

  container.add([
    glow,
    background,
    highlight,
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

export function createPausedOverlay(scene: Phaser.Scene): PausedOverlayElements {
  const container = scene.add.container(GAME_WIDTH / 2, BOARD_ORIGIN_Y + 36);
  const background = scene.add.rectangle(0, 0, 138, 48, 0x020617, 0.9);
  background.setStrokeStyle(1, 0xfbbf24, 1);

  const label = scene.add.text(0, -10, 'Paused', {
    color: '#fef3c7',
    fontFamily: 'Arial',
    fontSize: '15px',
  }).setOrigin(0.5);

  const hint = scene.add.text(0, 10, 'P or tap Resume', {
    color: '#fde68a',
    fontFamily: 'Arial',
    fontSize: '12px',
  }).setOrigin(0.5);

  container.add([background, label, hint]);
  return { container };
}

export function createGameOverOverlay(
  scene: Phaser.Scene,
  actions: { onRestart: () => void },
): GameOverOverlayElements {
  const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 18);
  const background = scene.add.rectangle(0, 0, 270, 228, 0x020617, 0.94);
  background.setStrokeStyle(2, 0xf87171, 1);

  const title = scene.add.text(0, -62, 'Game Over', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '28px',
  }).setOrigin(0.5);

  const hint = scene.add.text(0, -4, 'Press Enter, R, or tap move, rotate, or drop', {
    color: '#d1d5db',
    fontFamily: 'Arial',
    fontSize: '18px',
  }).setOrigin(0.5);

  const scoreText = scene.add.text(0, 34, '', {
    color: '#93c5fd',
    fontFamily: 'Arial',
    fontSize: '16px',
    align: 'center',
  }).setOrigin(0.5);

  const bestText = scene.add.text(0, 64, '', {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '15px',
    align: 'center',
  }).setOrigin(0.5);

  const newBestText = scene.add.text(0, 88, 'New best!', {
    color: '#facc15',
    fontFamily: 'Arial',
    fontSize: '17px',
    fontStyle: 'bold',
    align: 'center',
  }).setOrigin(0.5);
  newBestText.setVisible(false);

  const restartCta = scene.add.text(0, 112, 'Restart', {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '16px',
    backgroundColor: '#dc2626',
    padding: { left: 18, right: 18, top: 8, bottom: 8 },
  }).setOrigin(0.5);
  restartCta.setInteractive({ useHandCursor: true });
  restartCta.on('pointerdown', actions.onRestart);

  container.add([
    background,
    title,
    hint,
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
