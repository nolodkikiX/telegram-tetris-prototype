import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../../app/config';

const BOARD_ORIGIN_Y = 108;

export interface StartOverlayElements {
  container: Phaser.GameObjects.Container;
  bestText: Phaser.GameObjects.Text;
  lastScoreText: Phaser.GameObjects.Text;
  lastLevelText: Phaser.GameObjects.Text;
  lastLinesText: Phaser.GameObjects.Text;
  sessionsText: Phaser.GameObjects.Text;
  totalLinesText: Phaser.GameObjects.Text;
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
    lastScore: number;
    lastLevel: number;
    lastLines: number;
    sessionsPlayed: number;
    totalLinesCleared: number;
    runtimeHint: string;
  },
  actions: {
    onToggleHaptics: () => void;
    onStart: () => void;
  },
): StartOverlayElements {
  const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 36);
  const background = scene.add.rectangle(0, 0, 268, 280, 0x020617, 0.94);
  background.setStrokeStyle(2, 0x60a5fa, 1);

  const title = scene.add.text(0, -90, 'Telegram Tetris', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '24px',
  }).setOrigin(0.5);

  const bestText = scene.add.text(-88, -56, `Best score: ${data.bestScore}`, {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '13px',
  }).setOrigin(0, 0.5);

  const lastScoreText = scene.add.text(-88, -34, `Last score: ${data.lastScore}`, {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '13px',
  }).setOrigin(0, 0.5);

  const lastLevelText = scene.add.text(-88, -12, `Last level: ${data.lastLevel}`, {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '13px',
  }).setOrigin(0, 0.5);

  const lastLinesText = scene.add.text(14, -56, `Last lines: ${data.lastLines}`, {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '13px',
  }).setOrigin(0, 0.5);

  const sessionsText = scene.add.text(14, -34, `Sessions: ${data.sessionsPlayed}`, {
    color: '#94a3b8',
    fontFamily: 'Arial',
    fontSize: '13px',
  }).setOrigin(0, 0.5);

  const totalLinesText = scene.add.text(14, -12, `Total lines: ${data.totalLinesCleared}`, {
    color: '#94a3b8',
    fontFamily: 'Arial',
    fontSize: '13px',
  }).setOrigin(0, 0.5);

  const objectiveHint = scene.add.text(0, 18, 'Stack pieces and clear full lines.', {
    color: '#93c5fd',
    fontFamily: 'Arial',
    fontSize: '15px',
    align: 'center',
    wordWrap: { width: 228 },
  }).setOrigin(0.5);

  const desktopHint = scene.add.text(
    0,
    42,
    'Desktop: arrows + Space + P\nTouch: buttons below move, rotate, drop',
    {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: 224 },
      lineSpacing: 2,
    },
  ).setOrigin(0.5);

  const runtimeHint = scene.add.text(0, 74, data.runtimeHint, {
    color: '#94a3b8',
    fontFamily: 'Arial',
    fontSize: '12px',
    align: 'center',
    wordWrap: { width: 220 },
  }).setOrigin(0.5);

  const hapticsToggleText = scene.add.text(0, 104, '', {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '13px',
    backgroundColor: '#0f172a',
    padding: { left: 10, right: 10, top: 5, bottom: 5 },
  }).setOrigin(0.5);
  hapticsToggleText.setInteractive({ useHandCursor: true });
  hapticsToggleText.on('pointerdown', actions.onToggleHaptics);

  const cta = scene.add.text(0, 136, 'Press Enter or tap to start', {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: '14px',
    backgroundColor: '#1d4ed8',
    padding: { left: 14, right: 14, top: 8, bottom: 8 },
  }).setOrigin(0.5);
  cta.setInteractive({ useHandCursor: true });
  cta.on('pointerdown', actions.onStart);

  container.add([
    background,
    title,
    bestText,
    lastScoreText,
    lastLevelText,
    lastLinesText,
    sessionsText,
    totalLinesText,
    objectiveHint,
    desktopHint,
    runtimeHint,
    hapticsToggleText,
    cta,
  ]);

  return {
    container,
    bestText,
    lastScoreText,
    lastLevelText,
    lastLinesText,
    sessionsText,
    totalLinesText,
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
