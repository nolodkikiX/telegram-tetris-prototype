import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../../app/config';
import { LIQUID_GLASS_TOKENS } from './visualTokens';

export interface TouchControlVisual {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export interface TouchControlsElements {
  panel: Phaser.GameObjects.Container;
  actionControls: TouchControlVisual[];
  pauseControl: TouchControlVisual;
}

function getBottomSafeAreaInset(): number {
  try {
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    document.body.appendChild(probe);
    const inset = Number.parseFloat(getComputedStyle(probe).paddingBottom || '0');
    probe.remove();
    return Number.isFinite(inset) ? inset : 0;
  } catch {
    return 0;
  }
}

function createControlButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onPress: () => void,
  width = 54,
  height = 42,
  fontSize = '14px',
): TouchControlVisual {
  const button = scene.add.container(x, y);
  const background = scene.add.rectangle(0, 0, width, height, LIQUID_GLASS_TOKENS.controlFill, 0.96)
    .setStrokeStyle(1, LIQUID_GLASS_TOKENS.controlStroke, 0.95)
    .setInteractive({ useHandCursor: true });
  const highlight = scene.add.rectangle(
    0,
    -height * 0.26,
    width - 10,
    6,
    LIQUID_GLASS_TOKENS.controlHighlight,
    0.1,
  );
  const text = scene.add.text(0, 0, label, {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize,
    fontStyle: 'bold',
  }).setOrigin(0.5);

  background.on('pointerdown', () => {
    background.setFillStyle(LIQUID_GLASS_TOKENS.controlFillPressed, 1);
    onPress();
  });
  background.on('pointerup', () => background.setFillStyle(LIQUID_GLASS_TOKENS.controlFill, 0.96));
  background.on('pointerout', () => background.setFillStyle(LIQUID_GLASS_TOKENS.controlFill, 0.96));

  button.add([background, highlight, text]);
  return { container: button, background, text };
}

export function createTouchControls(
  scene: Phaser.Scene,
  actions: {
    onSoftDrop: () => void;
    onMoveLeft: () => void;
    onRotate: () => void;
    onMoveRight: () => void;
    onHardDrop: () => void;
    onPauseToggle: () => void;
  },
  layout: {
    boardBottomY: number;
  },
): TouchControlsElements {
  const safeBottom = getBottomSafeAreaInset();
  const panelTop = layout.boardBottomY;
  const panelHeight = Math.max(0, GAME_HEIGHT - panelTop);
  const contentBottom = GAME_HEIGHT - Math.max(12, safeBottom);
  const mainRowY = panelTop + Math.min(58, Math.floor((contentBottom - panelTop) * 0.62));
  const topRowY = panelTop + Math.min(24, Math.floor((contentBottom - panelTop) * 0.26));

  const panelBackground = scene.add.rectangle(
    GAME_WIDTH / 2,
    panelTop + panelHeight / 2,
    GAME_WIDTH,
    panelHeight,
    0x050b19,
    0.96,
  ).setStrokeStyle(1, 0x162236, 1);

  const panel = scene.add.container(0, 0, [panelBackground]);

  const softDropControl = createControlButton(scene, 54, mainRowY, 'SOFT', actions.onSoftDrop, 60, 42, '11px');
  const leftControl = createControlButton(scene, 140, mainRowY, '<', actions.onMoveLeft, 58, 44, '20px');
  const rotateControl = createControlButton(scene, 180, topRowY, 'ROT', actions.onRotate, 72, 34, '11px');
  const rightControl = createControlButton(scene, 220, mainRowY, '>', actions.onMoveRight, 58, 44, '20px');
  const hardDropControl = createControlButton(scene, 306, mainRowY, 'DROP', actions.onHardDrop, 64, 42, '12px');

  const actionControls = [
    softDropControl,
    leftControl,
    rotateControl,
    rightControl,
    hardDropControl,
  ];

  const pauseControl = createControlButton(scene, 306, topRowY, 'PAUSE', actions.onPauseToggle, 64, 34, '10px');

  panel.add([...actionControls.map((control) => control.container), pauseControl.container]);

  return {
    panel,
    actionControls,
    pauseControl,
  };
}

export function refreshTouchPauseToggleText(pauseControl: TouchControlVisual, isManuallyPaused: boolean): void {
  pauseControl.text.setText(isManuallyPaused ? 'RESUME' : 'PAUSE');
}

export function refreshTouchPauseControlState(
  pauseControl: TouchControlVisual,
  isAvailable: boolean,
): void {
  pauseControl.container.setAlpha(isAvailable ? 1 : 0.35);
}

export function refreshTouchActionControlState(
  actionControls: TouchControlVisual[],
  isManuallyPaused: boolean,
): void {
  const alpha = isManuallyPaused ? 0.35 : 1;

  for (const control of actionControls) {
    control.container.setAlpha(alpha);
  }
}
