import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../../app/config';

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
  width = 52,
  fontSize?: string,
): TouchControlVisual {
  const button = scene.add.container(x, y);
  const background = scene.add.rectangle(0, 0, width, 44, 0x1e293b, 0.95)
    .setStrokeStyle(2, 0x475569, 1)
    .setInteractive({ useHandCursor: true });

  const text = scene.add.text(0, 0, label, {
    color: '#f8fafc',
    fontFamily: 'Arial',
    fontSize: fontSize ?? (label === 'DROP' ? '14px' : '20px'),
  }).setOrigin(0.5);

  background.on('pointerdown', () => {
    background.setFillStyle(0x334155, 1);
    onPress();
  });
  background.on('pointerup', () => background.setFillStyle(0x1e293b, 0.95));
  background.on('pointerout', () => background.setFillStyle(0x1e293b, 0.95));

  button.add([background, text]);
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
): TouchControlsElements {
  const safeBottom = getBottomSafeAreaInset();
  const panelHeight = 92 + safeBottom;
  const panelTop = GAME_HEIGHT - panelHeight;
  const pauseRowY = panelTop + 18;
  const mainRowY = panelTop + 56;

  const panelBackground = scene.add.rectangle(
    GAME_WIDTH / 2,
    panelTop + panelHeight / 2,
    GAME_WIDTH,
    panelHeight,
    0x020617,
    0.96,
  ).setStrokeStyle(1, 0x1e293b, 1);

  const panel = scene.add.container(0, 0, [panelBackground]);

  const actionControls = [
    createControlButton(scene, 42, mainRowY, '▼', actions.onSoftDrop, 56, '16px'),
    createControlButton(scene, 128, mainRowY, '←', actions.onMoveLeft, 52),
    createControlButton(scene, 180, mainRowY, '⟳', actions.onRotate, 52),
    createControlButton(scene, 232, mainRowY, '→', actions.onMoveRight, 52),
    createControlButton(scene, 318, mainRowY, 'DROP', actions.onHardDrop, 64, '14px'),
  ];

  const pauseControl = createControlButton(scene, 318, pauseRowY, 'Pause', actions.onPauseToggle, 64, '13px');

  panel.add([...actionControls.map((control) => control.container), pauseControl.container]);

  return {
    panel,
    actionControls,
    pauseControl,
  };
}

export function refreshTouchPauseToggleText(pauseControl: TouchControlVisual, isManuallyPaused: boolean): void {
  pauseControl.text.setText(isManuallyPaused ? 'Resume' : 'Pause');
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
